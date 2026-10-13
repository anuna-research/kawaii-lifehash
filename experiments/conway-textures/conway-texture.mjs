// LifeHash-inspired surface: Conway history becomes a quiet cellular relief.
// This is decorative artwork, not a LifeHash identity fingerprint.
const SIDE = 100;
const TILE = 800;
const GENERATIONS = 32;

// One opacity and line weight for every concept, in both themes.
const textureOpacity = contrast => Math.min(1, Math.max(0, contrast) / 50);
const STROKE_WIDTH = 4;

export const PATTERNS = Object.freeze(['dunes', 'relief', 'scales', 'filaments', 'weave', 'grain']);
export const EXPERIMENTAL_PATTERNS = Object.freeze(['stipple', 'trails', 'loops', 'hatching', 'pebbles', 'ripples', 'cells']);

export function randomSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

// Recommended API: compute the Life history once, reuse across patterns/themes.
export function createTexture(seed = randomSeed()) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('Seed must be an unsigned 32-bit integer.');
  const visits = lifeRelief(seed);
  const svg = ({ pattern = 'dunes', theme = 'dark', opacity = 0.035 } = {}) => {
    if (![...PATTERNS, ...EXPERIMENTAL_PATTERNS].includes(pattern)) throw new RangeError('Unknown texture pattern.');
    if (!['dark', 'light'].includes(theme)) throw new RangeError('Theme must be dark or light.');
    if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) throw new RangeError('Opacity must be between 0 and 1.');
    return reliefSVG(visits, theme, opacity * 50, pattern);
  };
  return Object.freeze({
    seed,
    svg,
    css: options => `url("data:image/svg+xml,${encodeURIComponent(svg(options))}")`,
  });
}

export function lifeRelief(seed) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  let cells = Uint8Array.from({ length: SIDE * SIDE }, () => Number(random() < 0.38));
  const visits = new Uint8Array(cells.length);
  for (let generation = 0; generation < GENERATIONS; generation++) {
    const next = new Uint8Array(cells.length);
    for (let y = 0; y < SIDE; y++) {
      for (let x = 0; x < SIDE; x++) {
        const i = y * SIDE + x;
        visits[i] += cells[i];
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) neighbors += cells[((y + dy + SIDE) % SIDE) * SIDE + (x + dx + SIDE) % SIDE];
          }
        }
        next[i] = Number(neighbors === 3 || (cells[i] && neighbors === 2));
      }
    }
    cells = next;
  }
  return visits;
}

export function reliefSVG(visits, theme, contrast = 1, pattern = 'relief') {
  const light = theme === 'light';
  const ink = light ? '#6f6a57' : '#aeb7c4';
  if (['dunes', 'weave', 'stipple', 'grain', 'scales', 'trails', 'loops', 'filaments', 'hatching'].includes(pattern)) {
    return conceptSVG(visits, ink, light, contrast, pattern);
  }
  const cell = TILE / SIDE;
  // Smooth the history, trace its level sets, then round each contour turn.
  // Sample beyond the tile with wrapping so curves continue through seams.
  const sample = (x, y) => visits[((y % SIDE + SIDE) % SIDE) * SIDE + (x % SIDE + SIDE) % SIDE];
  const field = Float32Array.from(visits, (_, i) => {
    const x = i % SIDE, y = Math.floor(i / SIDE);
    return (sample(x, y) * 4 + (sample(x - 1, y) + sample(x + 1, y) + sample(x, y - 1) + sample(x, y + 1)) * 2
      + sample(x - 1, y - 1) + sample(x + 1, y - 1) + sample(x - 1, y + 1) + sample(x + 1, y + 1)) / 16;
  });
  const value = (x, y) => field[((y % SIDE + SIDE) % SIDE) * SIDE + (x % SIDE + SIDE) % SIDE];
  const format = point => `${point[0].toFixed(2)} ${point[1].toFixed(2)}`;
  const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const levels = pattern === 'pebbles' ? [5.5] : pattern === 'ripples' ? [2, 3.5, 5, 7, 10, 14] : pattern === 'cells' ? [3, 7] : [2.5, 5.5, 11.5];
  const contours = levels.map(level => {
    const nodes = new Map();
    const segments = [];
    const key = p => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
    const add = (a, b) => {
      const index = segments.length;
      segments.push([a, b]);
      for (const p of [a, b]) {
        const id = key(p);
        if (!nodes.has(id)) nodes.set(id, []);
        nodes.get(id).push(index);
      }
    };
    for (let y = -2; y < SIDE + 2; y++) for (let x = -2; x < SIDE + 2; x++) {
      const points = [[x * cell, y * cell], [(x + 1) * cell, y * cell], [(x + 1) * cell, (y + 1) * cell], [x * cell, (y + 1) * cell]];
      const values = [value(x, y), value(x + 1, y), value(x + 1, y + 1), value(x, y + 1)];
      const crossings = [];
      for (let edge = 0; edge < 4; edge++) {
        const other = (edge + 1) % 4;
        if ((values[edge] >= level) === (values[other] >= level)) continue;
        const t = (level - values[edge]) / (values[other] - values[edge]);
        crossings.push(points[edge].map((v, axis) => v + (points[other][axis] - v) * t));
      }
      if (crossings.length === 2) add(...crossings);
      else if (crossings.length === 4) {
        // Resolve saddle cells consistently using their average history.
        if ((values.reduce((a, b) => a + b, 0) / 4 >= level) === (values[0] >= level)) {
          add(crossings[0], crossings[1]); add(crossings[2], crossings[3]);
        } else { add(crossings[0], crossings[3]); add(crossings[1], crossings[2]); }
      }
    }
    const used = new Set();
    let path = '';
    // Trace open curves from their endpoints before tracing closed islands.
    const starts = [...nodes.entries()].filter(([, links]) => links.length === 1).map(([, links]) => links[0]);
    starts.push(...segments.map((_, i) => i));
    for (const start of starts) {
      if (used.has(start)) continue;
      const segment = segments[start];
      let current = nodes.get(key(segment[0])).length === 1 ? segment[0] : segment[1];
      const points = [current];
      let index = start;
      while (index !== undefined && !used.has(index)) {
        used.add(index);
        const [a, b] = segments[index];
        current = key(a) === key(current) ? b : a;
        points.push(current);
        index = nodes.get(key(current)).find(i => !used.has(i));
      }
      const closed = key(points[0]) === key(points[points.length - 1]);
      if (closed) {
        points.pop();
        if (pattern === 'cells') {
          path += `M${format(points[0])}`;
          for (let i = 1; i < points.length; i++) path += `L${format(points[i])}`;
          path += 'Z';
          continue;
        }
        path += `M${format(midpoint(points[points.length - 1], points[0]))}`;
        for (let i = 0; i < points.length; i++) path += `Q${format(points[i])} ${format(midpoint(points[i], points[(i + 1) % points.length]))}`;
        path += 'Z';
      } else {
        path += `M${format(points[0])}`;
        if (pattern === 'cells') {
          for (let i = 1; i < points.length; i++) path += `L${format(points[i])}`;
          continue;
        }
        for (let i = 1; i < points.length - 1; i++) path += `Q${format(points[i])} ${format(midpoint(points[i], points[i + 1]))}`;
        path += `L${format(points[points.length - 1])}`;
      }
    }
    return path;
  });
  const shapes = contours.map(contour => {
    return `<path d="${contour}" fill="none" stroke="${ink}" stroke-opacity="${textureOpacity(contrast)}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">${shapes}</svg>`;
}

function conceptSVG(visits, ink, light, contrast, pattern) {
  const sample = (x, y) => visits[((Math.floor(y) % SIDE + SIDE) % SIDE) * SIDE + (Math.floor(x) % SIDE + SIDE) % SIDE];
  const localHistory = (x, y) => (sample(x, y) * 4 + sample(x - 1, y) + sample(x + 1, y) + sample(x, y - 1) + sample(x, y + 1)) / 8;
  if (!visits.some(value => value > 0)) return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"/>`;
  let state = 2166136261;
  for (const value of visits) state = Math.imul(state ^ value, 16777619) >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const opacity = textureOpacity(contrast);
  const width = STROKE_WIDTH;
  const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  let shapes = '';
  if (pattern === 'loops') {
    // Truchet arc orientations come from local Life history, not coin flips.
    let path = '';
    for (let y = 0; y < TILE; y += 40) for (let x = 0; x < TILE; x += 40) {
      let activity = 0;
      for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 5; dx++) activity += sample(x / 8 + dx, y / 8 + dy);
      if (!activity) continue;
      if (Math.floor(activity / 5) % 2) {
        path += `M${point(x + 20, y)}A20 20 0 0 1 ${point(x, y + 20)}M${point(x + 40, y + 20)}A20 20 0 0 1 ${point(x + 20, y + 40)}`;
      } else {
        path += `M${point(x, y + 20)}A20 20 0 0 1 ${point(x + 20, y + 40)}M${point(x + 20, y)}A20 20 0 0 1 ${point(x + 40, y + 20)}`;
      }
    }
    shapes = `<path d="${path}" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
  } else if (pattern === 'filaments') {
    // Smooth Conway history supplies vector angles for short flowing curves.
    const smoothed = new Float32Array(SIDE * SIDE);
    for (let y = 0; y < SIDE; y++) for (let x = 0; x < SIDE; x++) {
      let total = 0, weight = 0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const w = (4 - Math.abs(dx)) * (4 - Math.abs(dy));
        total += sample(x + dx, y + dy) * w; weight += w;
      }
      smoothed[y * SIDE + x] = total / weight;
    }
    const smoothSample = (x, y) => smoothed[((y % SIDE + SIDE) % SIDE) * SIDE + (x % SIDE + SIDE) % SIDE];
    const angleAt = (px, py) => {
      const x = Math.floor(px / 8), y = Math.floor(py / 8);
      const fx = px / 8 - x, fy = py / 8 - y;
      return ((smoothSample(x, y) * (1 - fx) + smoothSample(x + 1, y) * fx) * (1 - fy)
        + (smoothSample(x, y + 1) * (1 - fx) + smoothSample(x + 1, y + 1) * fx) * fy) * 0.65;
    };
    let path = '';
    for (let y = 16; y < TILE; y += 40) for (let x = 16; x < TILE; x += 40) {
      const activity = localHistory(x / 8, y / 8);
      if (activity < 1) continue;
      let px = x, py = y;
      const points = [[px, py]];
      for (let step = 0; step < 14 + Math.min(18, activity); step++) {
        const angle = angleAt(px, py);
        px += Math.cos(angle) * 4; py += Math.sin(angle) * 4;
        points.push([px, py]);
      }
      for (const ox of [-TILE, 0, TILE]) for (const oy of [-TILE, 0, TILE]) {
        if (!points.some(([a, b]) => a + ox >= -4 && a + ox <= TILE + 4 && b + oy >= -4 && b + oy <= TILE + 4)) continue;
        path += points.map(([a, b], i) => `${i ? 'L' : 'M'}${point(a + ox, b + oy)}`).join('');
      }
    }
    shapes = `<path d="${path}" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (pattern === 'hatching') {
    // Little engraved strokes follow local activity gradients and persistence.
    let path = '';
    for (let y = 12; y < TILE; y += 25) for (let x = 12; x < TILE; x += 25) {
      const activity = localHistory(x / 8, y / 8);
      if (activity < 2) continue;
      const gx = sample(x / 8 + 1, y / 8) - sample(x / 8 - 1, y / 8);
      const gy = sample(x / 8, y / 8 + 1) - sample(x / 8, y / 8 - 1);
      const angle = Math.round((Math.atan2(gy, gx) + Math.PI / 2) / (Math.PI / 4)) * Math.PI / 4;
      const length = Math.min(9, 3 + activity * 0.5);
      for (let mark = -1; mark <= 1; mark++) {
        const cx = x - Math.sin(angle) * mark * 5, cy = y + Math.cos(angle) * mark * 5;
        path += `M${point(cx - Math.cos(angle) * length, cy - Math.sin(angle) * length)}L${point(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length)}`;
      }
    }
    shapes = `<path d="${path}" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round"/>`;
  } else if (pattern === 'dunes') {
    // Scan lines bend around the actual accumulated Conway activity.
    // Wrapped, interpolated history keeps the field continuous at tile seams.
    const average = visits.reduce((sum, value) => sum + value, 0) / visits.length;
    const smooth = (x, y) => {
      let total = 0, weight = 0;
      for (let dx = -8; dx <= 8; dx++) for (let dy = -2; dy <= 2; dy++) {
        const w = (9 - Math.abs(dx)) * (3 - Math.abs(dy));
        total += sample(x + dx, y + dy) * w;
        weight += w;
      }
      return total / weight;
    };
    let path = '';
    for (let row = -2; row < 28; row++) {
      for (let x = 0; x <= TILE; x += 4) {
        const gridX = x / 8;
        const fraction = gridX - Math.floor(gridX);
        const a = smooth(Math.floor(gridX), row * 4);
        const b = smooth(Math.floor(gridX) + 1, row * 4);
        const y = row * 32 + (a * (1 - fraction) + b * fraction - average) * 7;
        path += `${x === 0 ? 'M' : 'L'}${point(x, y)}`;
      }
    }
    shapes = `<path d="${path}" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
  } else if (pattern === 'scales') {
    // Staggered arcs expand where cells stayed alive for more generations.
    let path = '';
    for (let row = 0; row < 32; row++) for (let column = 0; column < 32; column++) {
      const x = column * 25 + (row % 2 ? 12.5 : 0);
      const y = row * 25;
      const history = localHistory(x / 8, y / 8);
      if (history < 1.5) continue;
      const radius = Math.min(12, 4 + history * 0.5);
      for (const offset of x === 0 ? [0, TILE] : [0]) {
        path += `M${point(x + offset - radius, y)}Q${point(x + offset, y + radius * 1.6)} ${point(x + offset + radius, y)}`;
        if (history >= 9) path += `M${point(x + offset - radius * 0.65, y + 1)}Q${point(x + offset, y + radius)} ${point(x + offset + radius * 0.65, y + 1)}`;
      }
    }
    shapes = `<path d="${path}" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round"/>`;
  } else if (pattern === 'trails') {
    // Link each active patch toward its strongest neighbor: converging branches
    // trace the accumulated Life field rather than independent random walks.
    let path = '';
    for (let y = 0; y < TILE; y += 16) for (let x = 0; x < TILE; x += 16) {
      const history = localHistory(x / 8, y / 8);
      if (history < 2) continue;
      let best = history, target;
      for (let dy = -16; dy <= 16; dy += 16) for (let dx = -16; dx <= 16; dx += 16) {
        if (!dx && !dy) continue;
        const strength = localHistory((x + dx) / 8, (y + dy) / 8);
        if (strength > best) { best = strength; target = [x + dx, y + dy]; }
      }
      if (!target) continue;
      // Duplicate crossing segments around the tile to keep repetition seamless.
      const xOffsets = target[0] < 0 ? [0, TILE] : target[0] >= TILE ? [0, -TILE] : [0];
      const yOffsets = target[1] < 0 ? [0, TILE] : target[1] >= TILE ? [0, -TILE] : [0];
      for (const ox of xOffsets) for (const oy of yOffsets) {
        path += `M${point(x + ox, y + oy)}Q${point((x + target[0]) / 2 + ox, y + oy)} ${point(target[0] + ox, target[1] + oy)}`;
      }
    }
    shapes = `<path d="${path}" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (pattern === 'weave') {
    // Activity controls each crossing's bend, length, direction and ink.
    for (let y = 0; y < TILE; y += 25) for (let x = 0; x < TILE; x += 25) {
      const history = localHistory(x / 8, y / 8);
      if (history < 1) continue;
      const horizontal = sample(x / 8 - 1, y / 8) + sample(x / 8 + 1, y / 8) >= sample(x / 8, y / 8 - 1) + sample(x / 8, y / 8 + 1);
      const half = Math.min(11, 5 + history * 0.4);
      const bend = Math.min(7, history * 0.6).toFixed(2);
      let path = horizontal ? `M${point(x - half, y)}q${half} -${bend} ${half * 2} 0M${point(x, y + 6)}v10` : `M${point(x, y - half)}q${bend} ${half} 0 ${half * 2}M${point(x + 6, y)}h10`;
      if (x === 0 && horizontal) path += `M${point(TILE - half, y)}q${half} -${bend} ${half * 2} 0`;
      if (y === 0 && !horizontal) path += `M${point(x, TILE - half)}q${bend} ${half} 0 ${half * 2}`;
      shapes += `<path d="${path}"/>`;
    }
    shapes = `<g fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round">${shapes}</g>`;
  } else {
    for (let y = 4; y < TILE; y += 8) for (let x = 4; x < TILE; x += 8) {
      const history = visits[Math.floor(y / 8) * SIDE + Math.floor(x / 8)];
      if (!history || random() > Math.min(1, history / (pattern === 'stipple' ? 14 : 10))) continue;
      const px = x + (random() - 0.5) * 5;
      const py = y + (random() - 0.5) * 5;
      if (pattern === 'stipple') {
        const radius = (0.5 + Math.min(1, history / 16) * 0.65) * 2;
        shapes += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${radius.toFixed(2)}"/>`;
      } else {
        const length = 1 + Math.min(1, history / 16) * 3;
        const gx = sample(x / 8 + 1, y / 8) - sample(x / 8 - 1, y / 8);
        const gy = sample(x / 8, y / 8 + 1) - sample(x / 8, y / 8 - 1);
        const angle = Math.atan2(gy, gx) + Math.PI / 2;
        shapes += `<path d="M${point(px, py)}l${point(Math.cos(angle) * length, Math.sin(angle) * length)}"/>`;
      }
    }
    shapes = pattern === 'stipple' ? `<g fill="${ink}" fill-opacity="${opacity}">${shapes}</g>`
      : `<g fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round">${shapes}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">${shapes}</svg>`;
}

export function installChatTexture(root = document.documentElement) {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  const visits = lifeRelief(seed);
  for (const theme of ['dark', 'light']) {
    const url = `url("data:image/svg+xml,${encodeURIComponent(reliefSVG(visits, theme))}")`;
    root.style.setProperty(`--chat-texture-${theme}`, url);
  }
}
