import { getSaved, setSaved } from './api.js';
 
function renderSaved() {
  const items = getSaved();
  const grid = document.getElementById('saved-grid');
  const empty = document.getElementById('saved-empty');
  grid.innerHTML = '';
 
  if (!items.length) {
    empty.hidden = false;
    return;
  }
 
  empty.hidden = true;
 
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'country-card';
 
    const flagEl = document.createElement('div');
    flagEl.className = 'country-card__flag';

    if (item.code) {
      const flagImg = document.createElement('img');
      flagImg.src = `https://flagcdn.com/24x18/${item.code}.png`;
      flagImg.alt = `${item.name} flag`;
      flagImg.onerror = () => { flagImg.replaceWith(document.createTextNode('🏳')); };
      flagEl.appendChild(flagImg);
    } 
    else 
    {
      flagEl.textContent = '🏳';
    }
 
    const body = document.createElement('div');
    body.className = 'country-card__body';
 
    const nameEl = document.createElement('p');
    nameEl.className = 'country-card__name';
    nameEl.textContent = item.name;
 
    const meta = document.createElement('p');
    meta.className = 'country-card__meta';
    meta.textContent = `Pop. ${item.population?.toLocaleString() || 'N/A'} · ${item.capital || 'N/A'}`;
 
    const removeBtn = document.createElement('button');
    removeBtn.className = 'country-card__save';
    removeBtn.textContent = 'Remove';
 
    // closure: each button closes over its own item
    removeBtn.addEventListener('click', () => {
      const updated = getSaved().filter(saved => saved.name !== item.name);
      setSaved(updated);
      renderSaved();
    });
 
    body.appendChild(nameEl);
    body.appendChild(meta);
    body.appendChild(removeBtn);
    card.appendChild(flagEl);
    card.appendChild(body);
    grid.appendChild(card);
  });
}
 
renderSaved();

