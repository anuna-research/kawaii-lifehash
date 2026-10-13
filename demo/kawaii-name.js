/** Keep the syllable tables and recipe fixed for this version. */
export const NAME_VERSION = 'kawaii-name-v1';

const beginnings = ['mi', 'mo', 'mu', 'me', 'ma', 'ni', 'no', 'nu', 'na', 'ne', 'pi', 'po', 'pu', 'pa', 'pe', 'ki', 'ko', 'ku', 'ka', 'ke', 'ri', 'ro', 'ru', 'ra', 're', 'yu', 'yo', 'ya', 'su', 'so', 'sa', 'shi', 'chi', 'cho', 'chu', 'fu'];
const middles = ['mi', 'mo', 'mu', 'ni', 'no', 'nu', 'pi', 'po', 'pu', 'ki', 'ko', 'ku', 'ri', 'ro', 'ru', 'yu', 'yo', 'ya', 'chi', 'chu'];
const endings = ['mi', 'mo', 'mu', 'ni', 'no', 'nu', 'pi', 'po', 'pu', 'ki', 'ko', 'ku', 'ri', 'ro', 'ru', 'na', 'ne', 'ya', 'yo', 'chi', 'chu'];

/** Synchronous, browser/Node compatible; exact UTF-8 seed, no normalization. */
export function generateName(seed = '') {
  if (typeof seed !== 'string') throw new TypeError('Name seed must be a string.');
  // FNV-1a with a version prefix, followed by a fixed 32-bit PRNG.
  let state = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(`${NAME_VERSION}\0${seed}`)) {
    state = Math.imul(state ^ byte, 0x01000193) >>> 0;
  }
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const pick = items => items[Math.floor(next() * items.length)];
  const first = pick(beginnings);
  const pattern = next();
  let syllables;
  if (pattern < 0.15) syllables = [first, first];
  else if (pattern < 0.7) syllables = [first, pick(endings.filter(s => s !== first))];
  else {
    const middle = pick(middles.filter(s => s !== first));
    syllables = [first, middle, pick(endings.filter(s => s !== middle))];
  }
  const name = syllables.join('');
  return name[0].toUpperCase() + name.slice(1);
}
