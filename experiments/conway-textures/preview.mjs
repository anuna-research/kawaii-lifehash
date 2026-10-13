import {createTexture, PATTERNS, EXPERIMENTAL_PATTERNS, randomSeed} from './conway-texture.mjs';

const pattern = document.querySelector('#pattern');
const opacity = document.querySelector('#opacity');
const output = document.querySelector('#opacity-value');
const seedInput = document.querySelector('#seed');
const surface = document.querySelector('#surface');
const labels = {grain: 'Paper Grain', loops: 'Loops', filaments: 'Filaments'};
for (const [name, patterns] of [['Favourites', PATTERNS], ['Other experiments', EXPERIMENTAL_PATTERNS]]) {
  const group = document.createElement('optgroup');
  group.label = name;
  for (const value of patterns) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = labels[value] ?? value[0].toUpperCase() + value.slice(1);
    group.append(option);
  }
  pattern.append(group);
}

let texture = createTexture();
let pending;
function render() {
  const theme = document.body.classList.contains('light') ? 'light' : 'dark';
  output.value = `${opacity.value}%`;
  surface.style.backgroundImage = texture.css({pattern: pattern.value, theme, opacity: Number(opacity.value) / 100});
}
function setSeed(seed) {
  texture = createTexture(seed);
  seedInput.value = String(texture.seed);
  seedInput.setCustomValidity('');
  render();
}
pattern.addEventListener('change', render);
opacity.addEventListener('input', () => {
  cancelAnimationFrame(pending);
  pending = requestAnimationFrame(render);
});
seedInput.addEventListener('change', () => {
  seedInput.setCustomValidity('');
  if (seedInput.value !== '' && seedInput.checkValidity()) setSeed(Number(seedInput.value));
  else {seedInput.setCustomValidity('Enter an integer from 0 to 4294967295.');seedInput.reportValidity();}
});
document.querySelector('#reseed').addEventListener('click', () => setSeed(randomSeed()));
document.querySelector('#theme').addEventListener('click', event => {
  const light = document.body.classList.toggle('light');
  event.currentTarget.textContent = light ? 'Dark theme' : 'Light theme';
  render();
});
document.querySelector('#toggle-content').addEventListener('click', event => {
  const hidden = document.body.classList.toggle('texture-only');
  event.currentTarget.setAttribute('aria-pressed', String(hidden));
  event.currentTarget.textContent = hidden ? 'Show conversation' : 'Texture only';
});
seedInput.value = String(texture.seed);
render();
