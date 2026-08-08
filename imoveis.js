const inventory = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
const liveBase = 'https://www.tamadaimoveis.com.br';
const commercialTypes = new Set(['HALL', 'ROOM', 'BUILDING', 'OUTHOUSE']);
const typeLabels = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', TWO_STORY_HOUSE: 'Sobrado', LAND: 'Terreno',
  HALL: 'Salão', ROOM: 'Sala', BUILDING: 'Prédio', OUTHOUSE: 'Galpão', SMALL_FARM: 'Chácara'
};

const queryParams = new URLSearchParams(location.search);
const state = {
  purpose: queryParams.get('purpose') || 'all',
  query: queryParams.get('q') || queryParams.get('ref') || '',
  type: queryParams.get('type') || '',
  maxPrice: Number(queryParams.get('max') || 0),
  minBeds: Number(queryParams.get('beds') || 0),
  minBedsExact: Number(queryParams.get('beds') || 0) < 4,
  minGarages: 0,
  minGaragesExact: true,
  minArea: 0,
  maxArea: 0,
  affordable: queryParams.get('affordable') === '1',
  commercial: queryParams.get('commercial') === '1',
  garage: queryParams.get('garage') === '1',
  sort: 'featured',
  view: queryParams.get('view') === 'map' ? 'map' : 'grid',
  limit: 18
};

const el = {
  grid: document.querySelector('#catalogGrid'),
  count: document.querySelector('#resultCount'),
  heroCount: document.querySelector('#heroResultCount'),
  summary: document.querySelector('#activeSummary'),
  query: document.querySelector('#catalogQuery'),
  type: document.querySelector('#catalogType'),
  maxPrice: document.querySelector('#catalogMaxPrice'),
  sideMaxPrice: document.querySelector('#sideMaxPrice'),
  sideQuery: document.querySelector('#sideQuery'),
  affordableLabel: document.querySelector('#affordableLabel'),
  sort: document.querySelector('#catalogSort'),
  sideType: document.querySelector('#sideType'),
  load: document.querySelector('#loadCatalog'),
  gridView: document.querySelector('#gridView'),
  mapView: document.querySelector('#mapView'),
  filterPanel: document.querySelector('#filterPanel'),
  filterBackdrop: document.querySelector('#filterBackdrop'),
  filterBadge: document.querySelector('#filterBadge'),
  minArea: document.querySelector('#minArea'),
  maxArea: document.querySelector('#maxArea')
};

const extraTypes = [['OUTHOUSE', 'Galpão'], ['ROOM', 'Sala'], ['BUILDING', 'Prédio'], ['SMALL_FARM', 'Chácara']];
extraTypes.forEach(([value, label]) => {
  if (![...el.type.options].some(option => option.value === value)) el.type.add(new Option(label, value));
});

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function money(value, monthly = false) {
  if (!value) return 'Sob consulta';
  const text = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  return monthly ? `${text}/mês` : text;
}

function compactMoney(value) {
  if (!value) return 'Consulte';
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')} mi`;
  if (value >= 1000) return `R$ ${Math.round(value / 1000)} mil`;
  return `R$ ${value}`;
}

function priceFor(property) {
  if (state.purpose === 'rent') return property.rent;
  if (state.purpose === 'sale') return property.sale;
  return property.sale || property.rent;
}

function purposeLabel(property) {
  if (property.sale && property.rent) return 'Venda ou locação';
  return property.rent ? 'Para alugar' : 'À venda';
}

function displayPrice(property) {
  const useRent = state.purpose === 'rent' || (!property.sale && property.rent);
  return money(useRent ? property.rent : property.sale || property.rent, useRent);
}

function matches(property) {
  if (state.purpose === 'sale' && !property.sale) return false;
  if (state.purpose === 'rent' && !property.rent) return false;
  if (state.purpose === 'commercial' && !commercialTypes.has(property.type)) return false;
  if (state.query) {
    const haystack = normalize(`${property.ref} ${property.title} ${property.neighborhood} ${property.city}`);
    if (!haystack.includes(normalize(state.query))) return false;
  }
  if (state.type && property.type !== state.type) return false;
  const price = priceFor(property);
  if (state.maxPrice && (!price || price > state.maxPrice)) return false;
  if (state.minBeds) {
    const beds = Number(property.beds);
    if (state.minBedsExact ? beds !== state.minBeds : beds < state.minBeds) return false;
  }
  if (state.minGarages) {
    const garages = Number(property.garages);
    if (state.minGaragesExact ? garages !== state.minGarages : garages < state.minGarages) return false;
  }
  if (state.minArea && Number(property.area) < state.minArea) return false;
  if (state.maxArea && Number(property.area) > state.maxArea) return false;
  if (state.affordable && !(price && price <= affordableThreshold())) return false;
  if (state.commercial && !commercialTypes.has(property.type)) return false;
  if (state.garage && !Number(property.garages)) return false;
  return true;
}

function sortedResults() {
  const list = inventory.filter(matches);
  const price = property => priceFor(property) || Number.MAX_SAFE_INTEGER;
  if (state.sort === 'price-asc') list.sort((a, b) => price(a) - price(b));
  if (state.sort === 'price-desc') list.sort((a, b) => (price(b) === Number.MAX_SAFE_INTEGER ? 0 : price(b)) - (price(a) === Number.MAX_SAFE_INTEGER ? 0 : price(a)));
  if (state.sort === 'area-desc') list.sort((a, b) => Number(b.area) - Number(a.area));
  if (state.sort === 'recent') list.reverse();
  return list;
}

function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem('tamada-favorites') || '[]')); }
  catch { return new Set(); }
}

let favorites = loadFavorites();
function saveFavorites() {
  try { localStorage.setItem('tamada-favorites', JSON.stringify([...favorites])); } catch { /* preference only */ }
}

function specs(property) {
  const list = [`<span><iconify-icon icon="solar:ruler-angular-linear"></iconify-icon>${String(property.area || 0).replace('.', ',')} m²</span>`];
  if (property.beds) list.push(`<span><iconify-icon icon="solar:bed-linear"></iconify-icon>${property.beds}</span>`);
  if (property.baths) list.push(`<span><iconify-icon icon="solar:bath-linear"></iconify-icon>${property.baths}</span>`);
  if (property.garages) list.push(`<span><iconify-icon icon="solar:garage-linear"></iconify-icon>${property.garages}</span>`);
  return list.join('');
}

function card(property) {
  const rentOnly = !property.sale && Boolean(property.rent);
  const saved = favorites.has(property.ref);
  return `<article class="catalog-card" data-ref="${property.ref}">
    <div class="catalog-card-media">
      <a href="imovel.html?ref=${property.ref}"><img src="${property.image}" alt="${property.title} em ${property.neighborhood}" loading="lazy"></a>
      <span class="catalog-card-purpose">${purposeLabel(property)}</span><span class="catalog-card-code">${property.ref}</span>
      <button class="catalog-favorite ${saved ? 'saved' : ''}" type="button" data-favorite="${property.ref}" aria-label="${saved ? 'Remover dos favoritos' : 'Salvar imóvel'}"><iconify-icon icon="solar:heart-${saved ? 'bold' : 'linear'}"></iconify-icon></button>
    </div>
    <div class="catalog-card-copy"><p class="catalog-card-location">${property.neighborhood} · ${property.city}</p><h2>${property.title}</h2><div class="catalog-card-specs">${specs(property)}</div>
      <div class="catalog-card-bottom"><strong>${money(rentOnly ? property.rent : property.sale || property.rent, rentOnly)}<small>${typeLabels[property.type] || 'Imóvel'} · ${purposeLabel(property)}</small></strong><a href="imovel.html?ref=${property.ref}" aria-label="Abrir imóvel"><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a></div>
    </div></article>`;
}

function activeFilterCount() {
  return [state.purpose !== 'all', state.query, state.type, state.maxPrice, state.minBeds, state.minGarages, state.minArea, state.maxArea, state.affordable, state.commercial, state.garage].filter(Boolean).length;
}

function summaryText() {
  const parts = [];
  if (state.purpose === 'sale') parts.push('à venda');
  if (state.purpose === 'rent') parts.push('para alugar');
  if (state.purpose === 'commercial') parts.push('comerciais');
  if (state.query) parts.push(`em “${state.query}”`);
  if (state.type) parts.push(typeLabels[state.type] || state.type);
  if (state.maxPrice) parts.push(`até ${money(state.maxPrice)}`);
  return parts.length ? parts.join(' · ') : 'Todos os imóveis';
}

function updateUrl() {
  const params = new URLSearchParams();
  if (state.purpose !== 'all') params.set('purpose', state.purpose);
  if (state.query) params.set('q', state.query);
  if (state.type) params.set('type', state.type);
  if (state.maxPrice) params.set('max', state.maxPrice);
  if (state.minBeds) params.set('beds', state.minBeds);
  if (state.affordable) params.set('affordable', '1');
  if (state.commercial) params.set('commercial', '1');
  if (state.garage) params.set('garage', '1');
  if (state.view === 'map') params.set('view', 'map');
  history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
}

// Limite do checkbox "Até R$ ..." em Características — o mesmo valor usado
// nos cards de "Oportunidades" da home (compra até 260 mil, locação até 1.500/mês).
function affordableThreshold() {
  return state.purpose === 'rent' ? 1500 : 260000;
}

function updatePriceOptions() {
  const current = String(state.maxPrice || '');
  const rent = state.purpose === 'rent' || state.purpose === 'commercial';
  const options = rent
    ? [['', 'Sem limite'], ['1500', 'R$ 1.500/mês'], ['3000', 'R$ 3.000/mês'], ['5000', 'R$ 5.000/mês'], ['10000', 'R$ 10.000/mês'], ['30000', 'R$ 30.000/mês']]
    : [['', 'Sem limite'], ['260000', 'R$ 260 mil'], ['500000', 'R$ 500 mil'], ['900000', 'R$ 900 mil'], ['2000000', 'R$ 2 milhões'], ['5000000', 'R$ 5 milhões']];
  const optionsHtml = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');

  [el.maxPrice, el.sideMaxPrice].forEach(select => {
    if (!select) return;
    select.innerHTML = optionsHtml;
    select.value = [...select.options].some(option => option.value === current) ? current : '';
  });
  if (![...el.maxPrice.options].some(option => option.value === current)) state.maxPrice = 0;

  // "clico em Alugar mas o filtro ainda fica em Até R$ 260 mil" — o rótulo
  // seguia fixo pro valor da venda mesmo trocando a finalidade.
  if (el.affordableLabel) {
    el.affordableLabel.textContent = state.purpose === 'rent' ? 'Até R$ 1.500/mês' : 'Até R$ 260 mil';
  }
}

// Fonte única em hero-copy.js (carregado no <head>) — usado também pelo
// script inline do hero, que roda antes deste arquivo pra evitar o flash.
const HERO_COPY = window.HERO_COPY;

function updateHero() {
  const c = HERO_COPY[state.purpose] || HERO_COPY.all;
  const eb = document.querySelector('#heroEyebrow');
  const t = document.querySelector('#heroTitle');
  const s = document.querySelector('#heroSubtitle');
  const img = document.querySelector('.catalog-hero-media img');
  if (eb) eb.textContent = c.eyebrow;
  if (t) t.innerHTML = c.title;
  if (s) s.textContent = c.sub;
  if (img && c.img) img.src = c.img;

  // Sincroniza o item ativo da navbar do header com a aba atual
  const navMap = { sale: 'purpose=sale', rent: 'purpose=rent', commercial: 'purpose=commercial' };
  document.querySelectorAll('.desktop-nav > a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const match = navMap[state.purpose] ? href.includes(navMap[state.purpose]) : (state.purpose === 'all' && href.includes('purpose=sale'));
    a.classList.toggle('active', match);
  });
}

function syncControls() {
  updateHero();
  el.query.value = state.query;
  if (el.sideQuery) el.sideQuery.value = state.query;
  el.type.value = state.type;
  updatePriceOptions();
  el.sort.value = state.sort;
  document.querySelectorAll('[data-purpose]').forEach(button => button.classList.toggle('active', button.dataset.purpose === state.purpose));
  const radio = document.querySelector(`input[name="sidePurpose"][value="${state.purpose === 'commercial' ? 'all' : state.purpose}"]`);
  if (radio) radio.checked = true;
  document.querySelectorAll('#sideBedrooms button').forEach(button => button.classList.toggle('active', Number(button.dataset.value) === state.minBeds));
  el.sideType.value = state.type;
  document.querySelector('#onlyAffordable').checked = state.affordable;
  document.querySelector('#onlyCommercial').checked = state.commercial;
  document.querySelector('#onlyGarage').checked = state.garage;
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === state.view));
  if (window.refreshElegantSelects) window.refreshElegantSelects();
}

function render() {
  const results = sortedResults();
  el.count.textContent = results.length;
  el.heroCount.textContent = results.length;
  el.summary.textContent = summaryText();
  const visible = results.slice(0, state.limit);
  el.grid.innerHTML = visible.length ? visible.map(card).join('') : `<div class="catalog-empty"><iconify-icon icon="solar:map-point-search-linear"></iconify-icon><h2>Nenhum imóvel nessa combinação.</h2><p>Amplie a região ou remova alguns filtros para continuar.</p></div>`;
  el.load.hidden = results.length <= state.limit;
  if (!el.load.hidden) el.load.querySelector('span').textContent = `Mostrar mais ${Math.min(18, results.length - state.limit)} imóveis`;
  el.grid.querySelectorAll('[data-favorite]').forEach(button => button.addEventListener('click', () => toggleFavorite(button.dataset.favorite)));
  const count = activeFilterCount();
  el.filterBadge.hidden = count === 0;
  el.filterBadge.textContent = count;
  updateUrl();
  if (state.view === 'map') renderMapResults(results);
}

function toggleFavorite(ref) {
  favorites.has(ref) ? favorites.delete(ref) : favorites.add(ref);
  saveFavorites();
  render();
}

function setPurpose(purpose) {
  state.purpose = purpose;
  state.limit = 18;
  if (purpose === 'commercial') state.type = '';
  syncControls();
  render();
}

document.querySelectorAll('[data-purpose]').forEach(button => button.addEventListener('click', () => setPurpose(button.dataset.purpose)));
document.querySelectorAll('input[name="sidePurpose"]').forEach(input => input.addEventListener('change', () => setPurpose(input.value)));

document.querySelector('#catalogSearch').addEventListener('submit', event => {
  event.preventDefault();
  state.query = el.query.value.trim();
  state.type = el.type.value;
  state.maxPrice = Number(el.maxPrice.value || 0);
  state.limit = 18;
  syncControls();
  render();
});

el.sort.addEventListener('change', () => { state.sort = el.sort.value; state.limit = 18; render(); });
el.load.addEventListener('click', () => { state.limit += 18; render(); });

function bindNumberChips(selector, key) {
  document.querySelectorAll(`${selector} button`).forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll(`${selector} button`).forEach(item => item.classList.toggle('active', item === button));
    state[key] = Number(button.dataset.value || 0);
    state[`${key}Exact`] = !('min' in button.dataset);
    state.limit = 18; render();
  }));
}
bindNumberChips('#sideBedrooms', 'minBeds');
bindNumberChips('#sideGarages', 'minGarages');

el.sideType.addEventListener('change', () => {
  state.type = el.sideType.value;
  state.limit = 18;
  syncControls();
  render();
});

// Espelha o campo de localização da barra de cima — os dois escrevem no
// mesmo state.query, then debounce igual ao de área pra não filtrar a cada tecla.
let queryTimer;
if (el.sideQuery) el.sideQuery.addEventListener('input', () => {
  clearTimeout(queryTimer);
  queryTimer = setTimeout(() => {
    state.query = el.sideQuery.value.trim();
    el.query.value = state.query;
    state.limit = 18;
    render();
  }, 220);
});

if (el.sideMaxPrice) el.sideMaxPrice.addEventListener('change', () => {
  state.maxPrice = Number(el.sideMaxPrice.value || 0);
  el.maxPrice.value = el.sideMaxPrice.value;
  state.limit = 18;
  render();
  if (window.refreshElegantSelects) window.refreshElegantSelects();
});

let areaTimer;
[el.minArea, el.maxArea].forEach(input => input.addEventListener('input', () => {
  clearTimeout(areaTimer);
  areaTimer = setTimeout(() => { state.minArea = Number(el.minArea.value || 0); state.maxArea = Number(el.maxArea.value || 0); state.limit = 18; render(); }, 220);
}));

document.querySelector('#onlyAffordable').addEventListener('change', event => { state.affordable = event.target.checked; render(); });
document.querySelector('#onlyCommercial').addEventListener('change', event => { state.commercial = event.target.checked; render(); });
document.querySelector('#onlyGarage').addEventListener('change', event => { state.garage = event.target.checked; render(); });

function clearFilters() {
  Object.assign(state, { purpose: 'all', query: '', type: '', maxPrice: 0, minBeds: 0, minBedsExact: true, minGarages: 0, minGaragesExact: true, minArea: 0, maxArea: 0, affordable: false, commercial: false, garage: false, limit: 18 });
  el.minArea.value = ''; el.maxArea.value = '';
  document.querySelectorAll('.side-number-chips button').forEach(button => button.classList.toggle('active', button.dataset.value === '0'));
  document.querySelectorAll('.side-checks input').forEach(input => { input.checked = false; });
  syncControls(); render();
}
document.querySelector('#clearCatalogFilters').addEventListener('click', clearFilters);

/* Grid / map */
let map;
let markers = [];
let currentMapResults = [];

function hash(value) {
  let result = 0;
  for (let index = 0; index < value.length; index++) result = (Math.imul(31, result) + value.charCodeAt(index)) | 0;
  return result >>> 0;
}

const cityCenters = {
  'aruja': [-23.3965, -46.3204], 'itaquaquecetuba': [-23.4866, -46.3489],
  'santo andre': [-23.6639, -46.5383], 'sao paulo': [-23.5450, -46.5350]
};

function approximateCoords(property) {
  const base = cityCenters[normalize(property.city)] || cityCenters['sao paulo'];
  const value = hash(`${property.neighborhood}-${property.ref}`);
  const angle = (value % 360) * Math.PI / 180;
  const radius = normalize(property.city) === 'sao paulo' ? .018 + ((value >>> 8) % 48) / 1000 : .008 + ((value >>> 8) % 18) / 1000;
  return [base[0] + Math.cos(angle) * radius, base[1] + Math.sin(angle) * radius];
}

function mapIcon(property, index, active = false) {
  const value = priceFor(property) || property.sale || property.rent;
  return window.L.divIcon({ className: '', html: `<div class="catalog-pin ${active ? 'active' : ''}">${compactMoney(value)}</div>`, iconSize: [66, 36], iconAnchor: [33, 18] });
}

function initMap() {
  if (map || !window.L) return;
  const mapElement = document.querySelector('#catalogMap');
  map = window.L.map(mapElement, { center: [-23.545, -46.535], zoom: 11, scrollWheelZoom: false, zoomControl: true, attributionControl: false });
  let errors = 0;
  const tiles = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd', attribution: '© OpenStreetMap contributors · © CARTO' });
  tiles.on('tileerror', () => { if (++errors > 5) mapElement.classList.add('offline'); });
  tiles.addTo(map); window.L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);
}

function showMapCard(property, markerIndex) {
  const panel = document.querySelector('#floatingMapCard');
  document.querySelector('#floatingImage').src = property.image;
  document.querySelector('#floatingImage').alt = `${property.title} em ${property.neighborhood}`;
  document.querySelector('#floatingLocation').textContent = `${property.neighborhood} · ${property.city}`;
  document.querySelector('#floatingTitle').textContent = property.title;
  document.querySelector('#floatingPrice').textContent = displayPrice(property);
  document.querySelector('#floatingLink').href = `imovel.html?ref=${property.ref}`;
  panel.hidden = false;
  markers.forEach((marker, index) => marker.setIcon(mapIcon(currentMapResults[index], index, index === markerIndex)));
  document.querySelectorAll('.map-result-item').forEach((item, index) => item.classList.toggle('active', index === markerIndex));
  requestAnimationFrame(() => panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
}

function mapListItem(property, index) {
  return `<article class="map-result-item" data-map-index="${index}"><img src="${property.image}" alt="" loading="lazy"><div><p>${property.neighborhood}</p><h3>${property.title}</h3><strong>${displayPrice(property)}</strong></div></article>`;
}

function renderMapResults(results) {
  initMap();
  currentMapResults = results.slice(0, 60);
  const list = document.querySelector('#mapResultsList');
  list.innerHTML = currentMapResults.map(mapListItem).join('');
  markers.forEach(marker => marker.remove()); markers = [];
  currentMapResults.forEach((property, index) => {
    const marker = window.L.marker(approximateCoords(property), { icon: mapIcon(property, index) }).addTo(map);
    marker.on('click mouseover', () => showMapCard(property, index));
    markers.push(marker);
  });
  list.querySelectorAll('[data-map-index]').forEach(item => item.addEventListener('mouseenter', () => {
    const index = Number(item.dataset.mapIndex); showMapCard(currentMapResults[index], index); map.panTo(approximateCoords(currentMapResults[index]));
  }));
  if (currentMapResults.length) {
    const bounds = window.L.latLngBounds(currentMapResults.map(approximateCoords));
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
  }
  setTimeout(() => map.invalidateSize(), 50);
}

function switchView(view) {
  state.view = view;
  el.gridView.hidden = view !== 'grid';
  el.mapView.hidden = view !== 'map';
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  render();
}
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
document.querySelector('#closeMapCard').addEventListener('click', () => { document.querySelector('#floatingMapCard').hidden = true; });

/* Mobile filter drawer and navigation */
function toggleFilters(open) {
  el.filterPanel.classList.toggle('open', open); el.filterBackdrop.classList.toggle('open', open); document.body.classList.toggle('modal-open', open);
}
document.querySelector('#mobileFilterButton').addEventListener('click', () => toggleFilters(true));
document.querySelector('#closeFilters').addEventListener('click', () => toggleFilters(false));
el.filterBackdrop.addEventListener('click', () => toggleFilters(false));
document.querySelector('#focusFilters').addEventListener('click', () => {
  if (innerWidth <= 900) toggleFilters(true); else document.querySelector('#catalogSearch').scrollIntoView({ behavior: 'smooth' });
});

syncControls();
switchView(state.view);

const purposeScroller = document.querySelector('.catalog-purpose');
if (purposeScroller) {
  const updateScrollFade = () => {
    const atEnd = purposeScroller.scrollLeft + purposeScroller.clientWidth >= purposeScroller.scrollWidth - 2;
    purposeScroller.classList.toggle('at-end', atEnd);
  };
  purposeScroller.addEventListener('scroll', updateScrollFade, { passive: true });
  window.addEventListener('resize', updateScrollFade);
  updateScrollFade();
}
