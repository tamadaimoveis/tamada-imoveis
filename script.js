/*
 * Tamada Atlas Urbano
 * Dados abaixo normalizados dos snapshots locais em ../clean/assets/data.
 * Coordenadas representam centros aproximados de bairro, nunca endereços exatos.
 */
const featuredProperties = [
  {
    ref: 'AP7842-EIU', title: 'Apartamento com 3 quartos, 119 m²', type: 'APARTMENT',
    neighborhood: 'Quarta Parada', city: 'São Paulo', sale: 1850000, rent: 0,
    area: 119, beds: 3, baths: 4, garages: 2, image: 'assets/images/ap7842-interior.jpg',
    lat: -23.5515, lng: -46.5880,
    url: '/imovel/apartamento-sao-paulo-3-quartos-119-m/AP7842-EIU'
  },
  {
    ref: 'AP9008-EIU', title: 'Apartamento com 3 quartos, 88 m²', type: 'APARTMENT',
    neighborhood: 'Vila Bela', city: 'São Paulo', sale: 819000, rent: 0,
    area: 88, beds: 3, baths: 1, garages: 2, image: 'assets/images/ap9008-interior.jpg',
    lat: -23.5910, lng: -46.5562,
    url: '/imovel/apartamento-sao-paulo-3-quartos-88-m/AP9008-EIU'
  },
  {
    ref: 'AP8974-EIU', title: 'Apartamento com 2 quartos, 59 m²', type: 'APARTMENT',
    neighborhood: 'São Mateus', city: 'São Paulo', sale: 240000, rent: 0,
    area: 59, beds: 2, baths: 1, garages: 1, image: 'assets/images/ap8974-lazer.jpg',
    lat: -23.6125, lng: -46.4768,
    url: '/imovel/apartamento-sao-paulo-2-quartos-59-m/AP8974-EIU'
  },
  {
    ref: 'AP5402-EIU', title: 'Apartamento com 1 quarto, 36 m²', type: 'APARTMENT',
    neighborhood: 'Vila Granada', city: 'São Paulo', sale: 0, rent: 1500,
    area: 35.95, beds: 1, baths: 1, garages: 0, image: 'assets/images/ap5402-vila-granada.jpg',
    lat: -23.5247, lng: -46.5106,
    url: '/imovel/apartamento-sao-paulo-1-quarto-36-m/AP5402-EIU'
  },
  {
    ref: 'AP8934-EIU', title: 'Apartamento com 1 quarto, 25 m²', type: 'APARTMENT',
    neighborhood: 'Belenzinho', city: 'São Paulo', sale: 239900, rent: 0,
    area: 25, beds: 1, baths: 1, garages: 0, image: 'assets/images/ap8934-belenzinho.jpg',
    lat: -23.5390, lng: -46.5907,
    url: '/imovel/apartamento-sao-paulo-1-quarto-25-m/AP8934-EIU'
  },
  {
    ref: 'AP6692-EIU', title: 'Apartamento com 2 quartos, 33 m²', type: 'APARTMENT',
    neighborhood: 'Cidade A. E. Carvalho', city: 'São Paulo', sale: 250000, rent: 0,
    area: 33, beds: 2, baths: 1, garages: 0, image: 'assets/images/ap6692-lancamento.jpg',
    lat: -23.5260, lng: -46.4746,
    url: '/imovel/apartamento-sao-paulo-2-quartos-33-m/AP6692-EIU'
  },
  {
    ref: 'SL0446-EIU', title: 'Salão comercial, 350 m²', type: 'HALL',
    neighborhood: 'Maranhão', city: 'São Paulo', sale: 0, rent: 25000,
    area: 350, beds: 0, baths: 4, garages: 2, image: 'assets/images/sl0446-comercial.jpg',
    lat: -23.5398, lng: -46.5655,
    url: '/imovel/salao-sao-paulo-350-m/SL0446-EIU'
  },
  {
    ref: 'SO7729-EIU', title: 'Sobrado com 6 quartos, 600 m²', type: 'TWO_STORY_HOUSE',
    neighborhood: 'Jardim Imperial Hills III', city: 'Arujá', sale: 4800000, rent: 28000,
    area: 600, beds: 6, baths: 6, garages: 10, image: 'assets/images/so7729-aruja.jpg',
    lat: -23.4020, lng: -46.3270,
    url: '/imovel/sobrado-aruja-6-quartos-600-m/SO7729-EIU'
  },
  {
    ref: 'AP5842-EIU', title: 'Apartamento com 3 quartos, 76 m²', type: 'APARTMENT',
    neighborhood: 'Vila Domitila', city: 'São Paulo', sale: 0, rent: 2800,
    area: 76, beds: 3, baths: 1, garages: 2, image: 'assets/images/ap5842-vila-domitila.jpg',
    lat: -23.5165, lng: -46.5010,
    url: '/imovel/apartamento-sao-paulo-3-quartos-76-m/AP5842-EIU'
  },
  {
    ref: 'SO6951-EIU', title: 'Sobrado com 3 quartos, 177 m²', type: 'TWO_STORY_HOUSE',
    neighborhood: 'Vila Rio Branco', city: 'São Paulo', sale: 795000, rent: 0,
    area: 177, beds: 3, baths: 4, garages: 4, image: 'assets/images/so6951-vila-rio-branco.jpg',
    lat: -23.5124, lng: -46.4898,
    url: '/imovel/sobrado-sao-paulo-3-quartos-177-m/SO6951-EIU'
  },
  {
    ref: 'TE1181-EIU', title: 'Terreno, 400 m²', type: 'LAND',
    neighborhood: 'Vila Granada', city: 'São Paulo', sale: 2500000, rent: 0,
    area: 400, beds: 0, baths: 0, garages: 0, image: 'assets/images/te1181-vila-granada.jpg',
    lat: -23.5276, lng: -46.5080,
    url: '/imovel/terreno-sao-paulo-400-m/TE1181-EIU'
  },
  {
    ref: 'CA3287-EIU', title: 'Casa com 3 quartos, 100 m²', type: 'HOUSE',
    neighborhood: 'Engenheiro Goulart', city: 'São Paulo', sale: 880000, rent: 0,
    area: 100, beds: 3, baths: 2, garages: 2, image: 'assets/images/ca3287-engenheiro-goulart.jpg',
    lat: -23.4988, lng: -46.5159,
    url: '/imovel/casa-sao-paulo-3-quartos-100-m/CA3287-EIU'
  }
];

const catalogProperties = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
const featuredRefs = new Set(featuredProperties.map(property => property.ref));
const properties = [...featuredProperties, ...catalogProperties.filter(property => !featuredRefs.has(property.ref))];
const mapProperties = featuredProperties;

const liveBase = 'https://www.tamadaimoveis.com.br';
const typeLabels = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', TWO_STORY_HOUSE: 'Sobrado', HALL: 'Comercial', LAND: 'Terreno'
};

const state = {
  purpose: 'sale',
  quickFilter: 'all',
  location: '',
  type: '',
  maxPrice: 0,
  minBeds: 0,
  features: new Set(),
  activeMapIndex: 0
};

let visibleLimit = 12;

const dom = {
  header: document.querySelector('#siteHeader'),
  grid: document.querySelector('#propertyGrid'),
  propertyViewport: document.querySelector('#propertyViewport'),
  propertyPrev: document.querySelector('#propertyPrev'),
  propertyNext: document.querySelector('#propertyNext'),
  propertyPosition: document.querySelector('#propertyPosition'),
  count: document.querySelector('#resultsCount'),
  modal: document.querySelector('#searchModal'),
  heroLocation: document.querySelector('#heroLocation'),
  heroType: document.querySelector('#heroType'),
  heroPrice: document.querySelector('#heroPrice'),
  modalLocation: document.querySelector('#modalLocation'),
  modalType: document.querySelector('#modalType'),
  modalPrice: document.querySelector('#modalPrice'),
  modalCount: document.querySelector('#modalCount')
};

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function money(value, monthly = false) {
  if (!value) return 'Sob consulta';
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  return monthly ? `${formatted}/mês` : formatted;
}

function propertyPrice(property, purpose = state.purpose) {
  if (purpose === 'rent' && property.rent) return property.rent;
  if (purpose === 'sale' && property.sale) return property.sale;
  return property.sale || property.rent;
}

function purposeLabel(property) {
  if (property.sale && property.rent) return 'Venda ou locação';
  if (property.rent) return 'Para alugar';
  return 'À venda';
}

function displayPrice(property, purpose = state.purpose) {
  const useRent = purpose === 'rent' ? property.rent : (!property.sale && property.rent ? property.rent : 0);
  return money(useRent || property.sale, Boolean(useRent));
}

function matchesFilters(property, filters = state) {
  const text = normalize(`${property.neighborhood} ${property.city} ${property.ref} ${property.title}`);
  if (filters.location && !text.includes(normalize(filters.location))) return false;
  if (filters.type && property.type !== filters.type) return false;
  if (filters.minBeds && property.beds < filters.minBeds) return false;

  if (filters.purpose === 'sale' && !property.sale) return false;
  if (filters.purpose === 'rent' && !property.rent) return false;
  if (filters.purpose === 'commercial' && property.type !== 'HALL') return false;

  if (filters.quickFilter === 'sale' && !property.sale) return false;
  if (filters.quickFilter === 'rent' && !property.rent) return false;
  if (filters.quickFilter === 'commercial' && property.type !== 'HALL') return false;
  if (filters.quickFilter === 'affordable' && !(property.sale && property.sale <= 260000)) return false;

  const price = propertyPrice(property, filters.purpose);
  if (filters.maxPrice && (!price || price > filters.maxPrice)) return false;
  if (filters.features?.has('garage') && !property.garages) return false;
  if (filters.features?.has('apartment') && property.type !== 'APARTMENT') return false;
  if (filters.features?.has('affordable') && !(property.sale && property.sale <= 260000)) return false;
  if (filters.features?.has('commercial') && property.type !== 'HALL') return false;
  return true;
}

function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem('tamada-favorites') || '[]')); }
  catch { return new Set(); }
}

let favorites = loadFavorites();

function saveFavorites() {
  try { localStorage.setItem('tamada-favorites', JSON.stringify([...favorites])); }
  catch { /* visual preference only */ }
}

function toggleFavorite(ref) {
  favorites.has(ref) ? favorites.delete(ref) : favorites.add(ref);
  saveFavorites();
  renderProperties();
  updateMapFavorite();
}

function specsMarkup(property) {
  const specs = [`<span><iconify-icon icon="solar:ruler-angular-linear"></iconify-icon>${String(property.area).replace('.', ',')} m²</span>`];
  if (property.beds) specs.push(`<span><iconify-icon icon="solar:bed-linear"></iconify-icon>${property.beds}</span>`);
  if (property.baths) specs.push(`<span><iconify-icon icon="solar:bath-linear"></iconify-icon>${property.baths}</span>`);
  if (property.garages) specs.push(`<span><iconify-icon icon="solar:garage-linear"></iconify-icon>${property.garages}</span>`);
  return specs.join('');
}

function propertyCard(property) {
  const monthly = !property.sale && Boolean(property.rent);
  const currentPrice = monthly ? property.rent : property.sale || property.rent;
  return `
    <article class="property-card" data-ref="${property.ref}">
      <div class="property-media">
        <a href="imovel.html?ref=${property.ref}" aria-label="Conhecer ${property.title}">
          <img src="${property.image}" alt="${property.title} em ${property.neighborhood}" loading="lazy">
        </a>
        <span class="property-purpose">${purposeLabel(property)}</span>
        <span class="property-code">${property.ref}</span>
        <button class="favorite-button ${favorites.has(property.ref) ? 'saved' : ''}" type="button" data-favorite="${property.ref}" aria-label="${favorites.has(property.ref) ? 'Remover dos favoritos' : 'Salvar imóvel'}">
          <iconify-icon icon="solar:heart-${favorites.has(property.ref) ? 'bold' : 'linear'}"></iconify-icon>
        </button>
      </div>
      <div class="property-copy">
        <p class="property-location"><span>${property.neighborhood} · ${property.city}</span><span>${typeLabels[property.type] || 'Imóvel'}</span></p>
        <h3>${property.title}</h3>
        <div class="property-specs">${specsMarkup(property)}</div>
        <div class="property-price-row"><strong>${money(currentPrice, monthly)} ${property.sale && property.rent ? '<small>· venda ou aluguel</small>' : ''}</strong><a href="imovel.html?ref=${property.ref}" aria-label="Abrir imóvel"><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a></div>
      </div>
    </article>`;
}

function renderProperties() {
  const result = properties.filter(property => matchesFilters(property));
  dom.count.textContent = result.length;
  dom.grid.innerHTML = result.length
    ? result.slice(0, visibleLimit).map(propertyCard).join('')
    : `<div class="empty-results"><iconify-icon icon="solar:map-point-search-linear"></iconify-icon><h3>Nenhum imóvel nesta combinação.</h3><p>Tente ampliar a localização ou remover um filtro.</p><button class="button button-ink" type="button" data-reset-inline>Limpar busca</button></div>`;

  dom.grid.querySelectorAll('[data-favorite]').forEach(button => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favorite));
  });
  dom.grid.querySelector('[data-reset-inline]')?.addEventListener('click', resetSearch);
  const loadMore = document.querySelector('#loadMore');
  if (loadMore) {
    loadMore.hidden = result.length <= visibleLimit;
    loadMore.querySelector('span').textContent = `Mostrar mais ${Math.min(12, Math.max(0, result.length - visibleLimit))} imóveis`;
  }
  requestAnimationFrame(() => updatePropertyCarousel(true));
}

function updatePropertyCarousel(reset = false) {
  const viewport = dom.propertyViewport;
  if (!viewport || !dom.propertyPrev || !dom.propertyNext || !dom.propertyPosition) return;
  if (reset) viewport.scrollTo({ left: 0, behavior: 'auto' });
  const cards = [...dom.grid.querySelectorAll('.property-card')];
  const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth - 2);
  const firstCard = cards[0];
  const gap = firstCard ? parseFloat(getComputedStyle(dom.grid).columnGap || getComputedStyle(dom.grid).gap || '20') : 20;
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth;
  const active = cards.length ? Math.min(cards.length, Math.max(1, Math.round(viewport.scrollLeft / Math.max(step, 1)) + 1)) : 0;
  dom.propertyPrev.disabled = viewport.scrollLeft <= 2;
  dom.propertyNext.disabled = viewport.scrollLeft >= maxScroll;
  dom.propertyPosition.textContent = cards.length ? `${String(active).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}` : '00 / 00';
}

function movePropertyCarousel(direction) {
  const viewport = dom.propertyViewport;
  const firstCard = dom.grid.querySelector('.property-card');
  if (!viewport || !firstCard) return;
  const gap = parseFloat(getComputedStyle(dom.grid).columnGap || getComputedStyle(dom.grid).gap || '20');
  viewport.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior: 'smooth' });
}

if (dom.propertyViewport) {
  let scrollFrame;
  dom.propertyViewport.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => updatePropertyCarousel());
  }, { passive: true });
  dom.propertyViewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dom.propertyViewport.dataset.dragStart = String(event.clientX);
    dom.propertyViewport.dataset.dragScroll = String(dom.propertyViewport.scrollLeft);
    dom.propertyViewport.classList.add('is-dragging');
    dom.propertyViewport.setPointerCapture(event.pointerId);
  });
  dom.propertyViewport.addEventListener('pointermove', event => {
    if (!dom.propertyViewport.classList.contains('is-dragging')) return;
    const startX = Number(dom.propertyViewport.dataset.dragStart || event.clientX);
    const startScroll = Number(dom.propertyViewport.dataset.dragScroll || dom.propertyViewport.scrollLeft);
    dom.propertyViewport.scrollLeft = startScroll - (event.clientX - startX);
  });
  const stopPropertyDrag = () => dom.propertyViewport.classList.remove('is-dragging');
  dom.propertyViewport.addEventListener('pointerup', stopPropertyDrag);
  dom.propertyViewport.addEventListener('pointercancel', stopPropertyDrag);
  dom.propertyPrev.addEventListener('click', () => movePropertyCarousel(-1));
  dom.propertyNext.addEventListener('click', () => movePropertyCarousel(1));
  addEventListener('resize', () => updatePropertyCarousel());
}

function selectQuickFilter(filter) {
  visibleLimit = 12;
  state.quickFilter = filter;
  if (filter === 'sale' || filter === 'rent' || filter === 'commercial') state.purpose = filter;
  if (filter === 'affordable') state.purpose = 'sale';
  document.querySelectorAll('.filter-chip').forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
  document.querySelectorAll('.purpose-tab').forEach(button => button.classList.toggle('active', button.dataset.purpose === state.purpose));
  renderProperties();
}

document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => selectQuickFilter(button.dataset.filter)));
document.querySelectorAll('[data-quick-filter]').forEach(button => button.addEventListener('click', () => {
  selectQuickFilter(button.dataset.quickFilter);
  document.querySelector('#imoveis').scrollIntoView({ behavior: 'smooth' });
}));

function priceOptions(purpose, target) {
  const rent = purpose === 'rent' || purpose === 'commercial';
  const options = rent
    ? [['', 'Qualquer valor'], ['1500', 'Até R$ 1.500/mês'], ['3000', 'Até R$ 3.000/mês'], ['5000', 'Até R$ 5.000/mês'], ['10000', 'Até R$ 10.000/mês'], ['30000', 'Até R$ 30.000/mês']]
    : [['', 'Qualquer valor'], ['260000', 'Até R$ 260 mil'], ['500000', 'Até R$ 500 mil'], ['900000', 'Até R$ 900 mil'], ['2000000', 'Até R$ 2 milhões'], ['5000000', 'Até R$ 5 milhões']];
  const previous = target.value;
  target.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  if ([...target.options].some(option => option.value === previous)) target.value = previous;
}

document.querySelectorAll('.purpose-tab').forEach(button => button.addEventListener('click', () => {
  state.purpose = button.dataset.purpose;
  state.quickFilter = button.dataset.purpose;
  document.querySelectorAll('.purpose-tab').forEach(tab => tab.classList.toggle('active', tab === button));
  priceOptions(state.purpose, dom.heroPrice);
}));

document.querySelector('#heroSearch').addEventListener('submit', event => {
  event.preventDefault();
  const params = new URLSearchParams();
  if (state.purpose && state.purpose !== 'all') params.set('purpose', state.purpose);
  if (dom.heroLocation.value.trim()) params.set('q', dom.heroLocation.value.trim());
  if (dom.heroType.value) params.set('type', dom.heroType.value);
  if (dom.heroPrice.value) params.set('max', dom.heroPrice.value);
  window.location.href = `imoveis.html?${params}`;
});

/* Advanced search */
function openSearch() {
  if (!dom.modal.open) dom.modal.showModal();
  document.body.classList.add('modal-open');
  dom.modalLocation.value = state.location;
  dom.modalType.value = state.type;
  priceOptions(state.purpose, dom.modalPrice);
  dom.modalPrice.value = state.maxPrice || '';
  const radio = document.querySelector(`input[name="modalPurpose"][value="${state.purpose}"]`);
  if (radio) radio.checked = true;
  updateModalCount();
  setTimeout(() => dom.modalLocation.focus(), 80);
}

function closeSearch() {
  if (dom.modal.open) dom.modal.close();
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', openSearch));
document.querySelectorAll('[data-close-search]').forEach(button => button.addEventListener('click', closeSearch));
dom.modal.addEventListener('click', event => { if (event.target === dom.modal) closeSearch(); });
dom.modal.addEventListener('close', () => document.body.classList.remove('modal-open'));

function modalFilters() {
  const purpose = document.querySelector('input[name="modalPurpose"]:checked')?.value || 'sale';
  return {
    purpose,
    quickFilter: 'all',
    location: dom.modalLocation.value,
    type: dom.modalType.value,
    maxPrice: Number(dom.modalPrice.value || 0),
    minBeds: Number(document.querySelector('#bedroomChips .active')?.dataset.value || 0),
    features: new Set([...document.querySelectorAll('.feature-chips input:checked')].map(input => input.value))
  };
}

function updateModalCount() {
  const filters = modalFilters();
  dom.modalCount.textContent = properties.filter(property => matchesFilters(property, filters)).length;
}

document.querySelectorAll('input[name="modalPurpose"]').forEach(input => input.addEventListener('change', () => {
  priceOptions(input.value, dom.modalPrice);
  updateModalCount();
}));
document.querySelectorAll('#advancedSearch input, #advancedSearch select').forEach(control => control.addEventListener('input', updateModalCount));
document.querySelectorAll('#bedroomChips button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('#bedroomChips button').forEach(item => item.classList.toggle('active', item === button));
  updateModalCount();
}));

document.querySelector('#advancedSearch').addEventListener('submit', event => {
  event.preventDefault();
  const filters = modalFilters();
  const params = new URLSearchParams();
  if (filters.purpose && filters.purpose !== 'all') params.set('purpose', filters.purpose);
  if (filters.location) params.set('q', filters.location);
  if (filters.type) params.set('type', filters.type);
  if (filters.maxPrice) params.set('max', filters.maxPrice);
  if (filters.minBeds) params.set('beds', filters.minBeds);
  if (filters.features.has('garage')) params.set('garage', '1');
  if (filters.features.has('affordable')) params.set('affordable', '1');
  if (filters.features.has('commercial')) params.set('commercial', '1');
  if (filters.features.has('apartment')) params.set('type', 'APARTMENT');
  window.location.href = `imoveis.html?${params}`;
});

function resetSearch() {
  Object.assign(state, { purpose: 'sale', quickFilter: 'all', location: '', type: '', maxPrice: 0, minBeds: 0 });
  state.features.clear();
  visibleLimit = 12;
  dom.heroLocation.value = '';
  dom.heroType.value = '';
  priceOptions('sale', dom.heroPrice);
  document.querySelectorAll('.purpose-tab').forEach(button => button.classList.toggle('active', button.dataset.purpose === 'sale'));
  document.querySelectorAll('.filter-chip').forEach(button => button.classList.toggle('active', button.dataset.filter === 'all'));
  if (dom.modalLocation) dom.modalLocation.value = '';
  if (dom.modalType) dom.modalType.value = '';
  if (dom.modalPrice) priceOptions('sale', dom.modalPrice);
  document.querySelector('input[name="modalPurpose"][value="sale"]').checked = true;
  document.querySelectorAll('#bedroomChips button').forEach((button, index) => button.classList.toggle('active', index === 0));
  document.querySelectorAll('.feature-chips input').forEach(input => { input.checked = false; });
  renderProperties();
  updateModalCount();
}

document.querySelector('#clearSearch').addEventListener('click', resetSearch);
document.querySelector('#loadMore').addEventListener('click', () => {
  visibleLimit += 12;
  renderProperties();
});

/* Map */
let map;
let markers = [];
let tileErrors = 0;

function fuzzyCoords(property) {
  let hash = 0;
  for (let index = 0; index < property.ref.length; index++) hash = (Math.imul(31, hash) + property.ref.charCodeAt(index)) | 0;
  const angle = ((hash >>> 0) % 360) * Math.PI / 180;
  const meters = 130 + ((hash >>> 7) % 140);
  return [
    property.lat + (meters / 111000) * Math.cos(angle),
    property.lng + (meters / (111000 * Math.cos(property.lat * Math.PI / 180))) * Math.sin(angle)
  ];
}

function pinIcon(index, active = false) {
  return window.L.divIcon({
    className: '',
    html: `<div class="tamada-pin ${active ? 'active' : ''}"><span>${String(index + 1).padStart(2, '0')}</span></div>`,
    iconSize: [42, 48], iconAnchor: [20, 40]
  });
}

function initMap() {
  const mapElement = document.querySelector('#propertyMap');
  if (!window.L || !mapElement) return;
  map = window.L.map(mapElement, { center: [-23.555, -46.525], zoom: 11, zoomControl: false, scrollWheelZoom: false, attributionControl: false });
  const tiles = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '© OpenStreetMap contributors · © CARTO'
  });
  tiles.on('tileerror', () => {
    tileErrors += 1;
    if (tileErrors > 5) mapElement.classList.add('offline');
  });
  tiles.addTo(map);
  window.L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);

  mapProperties.forEach((property, index) => {
    const marker = window.L.marker(fuzzyCoords(property), { icon: pinIcon(index, index === 0) }).addTo(map);
    marker.on('click mouseover', () => activateMapProperty(index));
    markers.push(marker);
  });
  const bounds = window.L.latLngBounds(mapProperties.map(fuzzyCoords));
  map.fitBounds(bounds, { padding: [46, 46], maxZoom: 12 });
}

function activateMapProperty(index, pan = false) {
  state.activeMapIndex = index;
  const property = mapProperties[index];
  const image = document.querySelector('#mapCardImage');
  image.style.opacity = '0';
  setTimeout(() => { image.src = property.image; image.alt = `${property.title} em ${property.neighborhood}`; image.style.opacity = '1'; }, 150);
  document.querySelector('#mapIndex').textContent = `${String(index + 1).padStart(2, '0')} / ${String(mapProperties.length).padStart(2, '0')}`;
  document.querySelector('#mapCardPurpose').textContent = purposeLabel(property);
  document.querySelector('#mapCardLocation').textContent = `${property.neighborhood} · ${property.city}`;
  document.querySelector('#mapCardTitle').textContent = property.title;
  document.querySelector('#mapCardFeatures').innerHTML = specsMarkup(property);
  document.querySelector('#mapCardPrice').textContent = displayPrice(property, property.rent && !property.sale ? 'rent' : 'sale');
  document.querySelector('#mapCardLink').href = `imovel.html?ref=${property.ref}`;
  markers.forEach((marker, markerIndex) => marker.setIcon(pinIcon(markerIndex, markerIndex === index)));
  updateMapFavorite();
  document.querySelectorAll('[data-map-neighborhood]').forEach(item => item.classList.toggle('active', normalize(item.dataset.mapNeighborhood) === normalize(property.neighborhood)));
  if (map && pan) map.flyTo(fuzzyCoords(property), Math.max(map.getZoom(), 13), { duration: .7 });
}

function updateMapFavorite() {
  const button = document.querySelector('#mapFavorite');
  const saved = favorites.has(mapProperties[state.activeMapIndex].ref);
  button.classList.toggle('saved', saved);
  button.innerHTML = `<iconify-icon icon="solar:heart-${saved ? 'bold' : 'linear'}"></iconify-icon>`;
}

document.querySelector('#mapFavorite').addEventListener('click', () => toggleFavorite(mapProperties[state.activeMapIndex].ref));
document.querySelector('#mapZoomIn').addEventListener('click', () => map?.zoomIn());
document.querySelector('#mapZoomOut').addEventListener('click', () => map?.zoomOut());

const mapNeighborhoods = [...new Set(mapProperties.map(property => property.neighborhood))].slice(0, 6);
document.querySelector('#mapNeighborhoods').innerHTML = mapNeighborhoods.map((name, index) => `<button type="button" data-map-neighborhood="${name}" class="${index === 0 ? 'active' : ''}">${name}</button>`).join('');
document.querySelectorAll('[data-map-neighborhood]').forEach(button => button.addEventListener('click', () => {
  const index = mapProperties.findIndex(property => property.neighborhood === button.dataset.mapNeighborhood);
  document.querySelectorAll('[data-map-neighborhood]').forEach(item => item.classList.toggle('active', item === button));
  activateMapProperty(index, true);
}));

/* Atlas: alterna entre a lista de bairros e o mapa, na mesma seção */
const atlasViewList = document.querySelector('#atlasViewList');
const atlasViewMap = document.querySelector('#atlasViewMap');

const atlasSection = document.querySelector('.atlas-section');

function scrollTargetForAtlasTop() {
  return atlasSection.getBoundingClientRect().top + window.scrollY - 90;
}

function scrollTargetToCenter(element) {
  const rect = element.getBoundingClientRect();
  const headerOffset = 100;
  const extraSpace = window.innerHeight - rect.height - headerOffset;
  const gap = extraSpace > 0 ? extraSpace / 2 : 0;
  return rect.top + window.scrollY - headerOffset - gap;
}

function swapAtlasView(from, to, { getScrollTarget, onShow } = {}) {
  from.classList.remove('is-visible');
  setTimeout(() => {
    from.classList.remove('is-active');
    to.classList.add('is-active');
    map?.invalidateSize();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      map?.invalidateSize();
      const top = getScrollTarget ? getScrollTarget() : scrollTargetForAtlasTop();
      window.scrollTo({ top, behavior: 'smooth' });
      to.classList.add('is-visible');
      onShow?.();
    }));
  }, 280);
}

function showAtlasMap() {
  swapAtlasView(atlasViewList, atlasViewMap, {
    getScrollTarget: () => scrollTargetToCenter(document.querySelector('.map-shell'))
  });
}

function showAtlasList() {
  swapAtlasView(atlasViewMap, atlasViewList);
}

document.querySelectorAll('#atlasBack, [data-atlas-back]').forEach(button => button.addEventListener('click', showAtlasList));

document.querySelectorAll('[data-neighborhood]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-neighborhood]').forEach(item => item.classList.toggle('active', item === button));
  const found = mapProperties.findIndex(property => normalize(property.neighborhood).includes(normalize(button.dataset.neighborhood)));
  showAtlasMap();
  if (found >= 0) activateMapProperty(found, true);
}));

/* Header, mobile navigation and motion */
let scrollTick = false;
function onScroll() {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => {
    dom.header.classList.toggle('scrolled', window.scrollY > 90);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 900) {
      document.querySelectorAll('[data-parallax]').forEach(element => {
        const speed = Number(element.dataset.parallax || 0);
        const rect = element.parentElement.getBoundingClientRect();
        element.style.transform = `translate3d(0, ${rect.top * speed}px, 0)`;
      });
    }
    scrollTick = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menuToggle = document.querySelector('#menuToggle');
const mobileMenu = document.querySelector('#mobileMenu');
function closeMenu() {
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}
menuToggle.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('open');
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px' });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

if (window.matchMedia('(pointer:fine)').matches) {
  const glow = document.querySelector('#cursorGlow');
  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    glow.style.opacity = '1';
  }, { passive: true });

  document.querySelectorAll('.magnetic').forEach(element => {
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      element.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .08}px, ${(event.clientY - rect.top - rect.height / 2) * .1}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
}

document.querySelector('#currentYear').textContent = new Date().getFullYear();
renderProperties();
activateMapProperty(0);
window.addEventListener('load', initMap, { once: true });

const filterChipsScroller = document.querySelector('.filter-chips');
if (filterChipsScroller) {
  const updateFilterChipsFade = () => {
    const atEnd = filterChipsScroller.scrollLeft + filterChipsScroller.clientWidth >= filterChipsScroller.scrollWidth - 2;
    filterChipsScroller.classList.toggle('at-end', atEnd);
  };
  filterChipsScroller.addEventListener('scroll', updateFilterChipsFade, { passive: true });
  window.addEventListener('resize', updateFilterChipsFade);
  updateFilterChipsFade();
}
