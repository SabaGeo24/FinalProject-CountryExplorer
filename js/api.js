
const BASE_URL = 'https://api.restcountries.com/countries/v5';

const regionMap = {
  europe: 'Europe',
  asia: 'Asia',
  africa: 'Africa',
  'south-america': 'South America',
  'north-america': 'North America',
  australia: 'Oceania',
};

export async function fetchData(region) {
  const mapped = regionMap[region];
  const res = await fetch(`${BASE_URL}?region=${mapped}&limit=100`, {
    headers: { 'Authorization': 'Bearer rc_live_917cc0cb6ce14619b40573822fdae122' }
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export function getSaved() {
  const raw = localStorage.getItem('savedItems');
  return raw ? JSON.parse(raw) : [];
}

export function setSaved(items) {
  localStorage.setItem('savedItems', JSON.stringify(items));
}


