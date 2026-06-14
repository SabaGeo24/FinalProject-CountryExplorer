import { fetchData, getSaved, setSaved } from './api.js';

// --- State ---
let savedItems = getSaved();
let searchResults = [];

const sessionCounter = (() => {
  let count = 0;
  return { increment: () => ++count, get: () => count };
})();

function showLoading(visible) {
  document.getElementById('loading-msg').hidden = !visible;
}

function showError(message) {
  const el = document.getElementById('error-msg');
  el.textContent = message;
  el.hidden = !message;
}

function clearGrid() {
  document.getElementById('results-grid').innerHTML = '';
}

function isSaved(name) {
  return savedItems.some(c => c.name === name);
}

function toggleSave(country, btn) {
  if (isSaved(country.name)) {
    savedItems = savedItems.filter(c => c.name !== country.name);
    btn.textContent = 'Save';
  } else {
    savedItems.push(country);
    sessionCounter.increment();
    btn.textContent = 'Saved ✓';
  }
  setSaved(savedItems);
}

function renderResults(items) {
  clearGrid();
  if (!items.length) { showError('No countries matched your filters.'); return; }

  items.forEach(item => {
    const name = item.names?.common || 'Unknown';
    const flag = item.flag?.emoji || '🏳';
    const pop = item.population?.toLocaleString() || 'N/A';
    const capital = item.capitals?.[0]?.name || item.capitals?.[0] || 'N/A';
    const country = { name, flag, population: item.population || 0, capital };

    const card = document.createElement('article');
    card.className = 'country-card';

    const flagEl = document.createElement('div');
    flagEl.className = 'country-card__flag';
    flagEl.textContent = flag;

    const body = document.createElement('div');
    body.className = 'country-card__body';

    const nameEl = document.createElement('p');
    nameEl.className = 'country-card__name';
    nameEl.textContent = name;

    const meta = document.createElement('p');
    meta.className = 'country-card__meta';
    meta.textContent = `Pop. ${pop} · ${capital}`;

    const btn = document.createElement('button');
    btn.className = 'country-card__save';
    btn.textContent = isSaved(name) ? 'Saved ✓' : 'Save';

    btn.addEventListener('click', () => toggleSave(country, btn));

    body.appendChild(nameEl);
    body.appendChild(meta);
    body.appendChild(btn);
    card.appendChild(flagEl);
    card.appendChild(body);
    document.getElementById('results-grid').appendChild(card);
  });
}

function applyFilters(countries, { letter, population, landlocked }) {
  return countries.filter(c => {
    const name = c.names?.common || '';
    if (letter && !name.toLowerCase().startsWith(letter.toLowerCase())) return false;
    if (population && (c.population || 0) < Number(population)) return false;
    if (landlocked && !c.landlocked) return false;
    return true;
  });
}

function validate(region, population) {
  if (!region) return 'Please select a continent.';
  if (population === '' || Number(population) < 0) return 'Please enter a valid minimum population.';
  return null;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

const onLetterInput = debounce(() => {
  if (!searchResults.length) return;
  const letter = document.getElementById('startingLetter').value;
  const population = document.getElementById('population').value;
  const landlocked = document.getElementById('isLandlocked').checked;
  showError('');
  renderResults(applyFilters(searchResults, { letter, population, landlocked }));
}, 300);

document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const region = document.getElementById('region').value;
  const letter = document.getElementById('startingLetter').value;
  const population = document.getElementById('population').value;
  const landlocked = document.getElementById('isLandlocked').checked;

  const err = validate(region, population);
  if (err) { showError(err); return; }

  showError('');
  showLoading(true);
  clearGrid();

  try {
    const data = await fetchData(region);
    searchResults = data.objects;
    renderResults(applyFilters(searchResults, { letter, population, landlocked }));
  } catch (error) {
    showError('Failed to load countries. Please check your connection and try again.');
  } finally {
    showLoading(false);
  }
});

document.getElementById('startingLetter').addEventListener('input', onLetterInput);

document.getElementById('isLandlocked').addEventListener('change', () => {
  if (!searchResults.length) return;
  const letter = document.getElementById('startingLetter').value;
  const population = document.getElementById('population').value;
  const landlocked = document.getElementById('isLandlocked').checked;
  showError('');
  renderResults(applyFilters(searchResults, { letter, population, landlocked }));
});