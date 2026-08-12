/*
 * Tamada Atlas Urbano
 * Dados abaixo normalizados dos snapshots locais em ../clean/assets/data.
 * Coordenadas representam centros aproximados de bairro, nunca endereços exatos.
 */
/* Destaques da home: vêm do Sanity (campo "Destaque na Página Inicial" do
   imóvel). Antes eram 12 imóveis escritos à mão aqui, com foto local e
   coordenada fixa — o cliente não conseguia trocar sem mexer no código, e o
   mapa e a lista de bairros saíam desses mesmos 12.
   Sem nenhum marcado, cai nos mais recentes com foto, para a home nunca
   aparecer vazia. */
const catalogProperties = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
const marcados = catalogProperties.filter(p => p.featured);
const featuredProperties = (marcados.length ? marcados : catalogProperties.filter(p => p.image)).slice(0, 8);

const featuredRefs = new Set(featuredProperties.map(property => property.ref));
const properties = [...featuredProperties, ...catalogProperties.filter(property => !featuredRefs.has(property.ref))];

/* ── Mapa ────────────────────────────────────────────────────────────────
   Antes o mapa desenhava os mesmos 12 imóveis fixos, sempre nos mesmos
   bairros. Agora usa os bairros de MAIOR VOLUME reais, um imóvel
   representando cada um — assim os pinos se espalham pela cidade e a lista
   de bairros bate com o estoque.

   As coordenadas vêm de `TAMADA_BAIRROS`, calculadas na geração como a média
   das coordenadas dos imóveis de cada bairro. É o CENTRO do bairro, nunca o
   endereço de um imóvel. */
const bairrosComMapa = Array.isArray(window.TAMADA_BAIRROS) ? window.TAMADA_BAIRROS : [];
const centroDoBairro = new Map(bairrosComMapa.map(b => [normalize(b.nome), b]));

/* O mapa mostra UM bairro por vez, com vários pinos espalhados dentro dele.
   `mapProperties` é o bairro atualmente selecionado — trocado a cada clique. */
let mapProperties = [];
let bairroAtual = null;

// Teto de pinos por bairro: acima disso vira mancha e pesa o Leaflet sem
// acrescentar informação. Penha de França tem 241; 60 já preenche o bairro.
const MAX_PINOS = 60;
// Raio do espalhamento. Bairro em SP tem ~1–2 km de extensão; 700 m em volta
// do centro cobre a área sem vazar para o vizinho.
const RAIO_ESPALHAMENTO = 700;

function imoveisDoBairro(nome) {
  return properties.filter(p => normalize(p.neighborhood) === normalize(nome));
}

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
  activeMapIndex: -1
};

const dom = {
  header: document.querySelector('#siteHeader'),
  grid: document.querySelector('#propertyGrid'),
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
  if (filters.minBeds) {
    if (filters.minBedsExact ? property.beds !== filters.minBeds : property.beds < filters.minBeds) return false;
  }

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

function syncFavoriteButtons(container) {
  container?.querySelectorAll('[data-favorite]').forEach(button => {
    const saved = favorites.has(button.dataset.favorite);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-label', saved ? 'Remover dos favoritos' : 'Salvar imóvel');
    button.innerHTML = `<iconify-icon icon="solar:heart-${saved ? 'bold' : 'linear'}"></iconify-icon>`;
  });
}

function toggleFavorite(ref) {
  favorites.has(ref) ? favorites.delete(ref) : favorites.add(ref);
  saveFavorites();
  renderFeaturedGrid();
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
          <img src="${property.image}" alt="${property.title} em ${property.neighborhood}" loading="lazy" width="560" height="400">
        </a>
        <span class="property-purpose">${purposeLabel(property)}</span>
        <span class="property-code">${property.ref}</span>
        <button class="favorite-button ${favorites.has(property.ref) ? 'saved' : ''}" type="button" data-favorite="${property.ref}" aria-label="${favorites.has(property.ref) ? 'Remover dos favoritos' : 'Salvar imóvel'}">
          <iconify-icon icon="solar:heart-${favorites.has(property.ref) ? 'bold' : 'linear'}"></iconify-icon>
        </button>
      </div>
      <div class="property-copy">
        <p class="property-location"><span>${property.neighborhood} · ${property.city}</span><span>${typeLabels[property.type] || 'Imóvel'}</span></p>
        <h3><a href="imovel.html?ref=${property.ref}"><span>${property.title}</span></a></h3>
        <div class="property-specs">${specsMarkup(property)}</div>
        <div class="property-price-row"><strong>${money(currentPrice, monthly)} ${property.sale && property.rent ? '<small>· venda ou aluguel</small>' : ''}</strong><a href="imovel.html?ref=${property.ref}" aria-label="Abrir imóvel"><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a></div>
      </div>
    </article>`;
}

// Grade fixa dos imóveis em destaque (marcados no Sanity): 2 linhas de 4, sem
// carrossel, sem paginação. O cliente não quer navegação aqui — quem quer ver
// mais vai pro catálogo completo (imoveis.html).
function renderFeaturedGrid() {
  dom.grid.innerHTML = featuredProperties.map(propertyCard).join('');
  dom.grid.querySelectorAll('[data-favorite]').forEach(button => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favorite));
  });
}

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
    minBedsExact: !('min' in (document.querySelector('#bedroomChips .active')?.dataset || {})),
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
  dom.heroLocation.value = '';
  dom.heroType.value = '';
  priceOptions('sale', dom.heroPrice);
  document.querySelectorAll('.purpose-tab').forEach(button => button.classList.toggle('active', button.dataset.purpose === 'sale'));
  if (dom.modalLocation) dom.modalLocation.value = '';
  if (dom.modalType) dom.modalType.value = '';
  if (dom.modalPrice) priceOptions('sale', dom.modalPrice);
  document.querySelector('input[name="modalPurpose"][value="sale"]').checked = true;
  document.querySelectorAll('#bedroomChips button').forEach((button, index) => button.classList.toggle('active', index === 0));
  document.querySelectorAll('.feature-chips input').forEach(input => { input.checked = false; });
  updateModalCount();
}

document.querySelector('#clearSearch').addEventListener('click', resetSearch);

/* Map */
let map;
let markers = [];
let tileErrors = 0;

/* Posição do pino: centro do bairro + espalhamento derivado do código do
   imóvel. É uma posição APROXIMADA dentro do bairro, não o endereço — o
   endereço real não sai do Sanity (ver o bloco sobre privacidade no gerador).
   O mapa avisa isso e tem teto de zoom, então ninguém usa o pino para chegar
   numa porta.
   Derivado do `ref` e não aleatório: o pino fica no mesmo lugar toda vez que a
   página abre, senão o imóvel "pula" de posição a cada visita. */
function fuzzyCoords(property) {
  const centro = centroDoBairro.get(normalize(property.neighborhood || ''));
  if (!centro) return null;
  let hash = 0;
  const chave = property.ref || property.neighborhood || '';
  for (let index = 0; index < chave.length; index++) hash = (Math.imul(31, hash) + chave.charCodeAt(index)) | 0;
  const h = hash >>> 0;
  const angle = (h % 3600) / 3600 * 2 * Math.PI;
  // Raiz quadrada na distância: sem ela os pinos se acumulam no centro, porque
  // a área de um anel cresce com o raio.
  const meters = RAIO_ESPALHAMENTO * Math.sqrt(((h >>> 9) % 1000) / 1000);
  return [
    centro.lat + (meters / 111000) * Math.cos(angle),
    centro.lng + (meters / (111000 * Math.cos(centro.lat * Math.PI / 180))) * Math.sin(angle)
  ];
}

/* Troca o bairro exibido: limpa os pinos antigos, desenha os do bairro novo e
   enquadra. É o que faltava — antes os 12 pinos eram fixos e clicar num bairro
   só trocava o card. */
function mostrarBairroNoMapa(nome, focar = true) {
  if (!map) return;
  const centro = centroDoBairro.get(normalize(nome));
  if (!centro) return;
  bairroAtual = nome;

  markers.forEach(m => map.removeLayer(m));
  markers.length = 0;
  // Zera o índice: sem isto, trocar de bairro e cair de novo no pino 0 bateria
  // na guarda de "já é o ativo" do activateMapProperty e o card continuaria
  // mostrando o imóvel do bairro anterior.
  state.activeMapIndex = -1;

  mapProperties = imoveisDoBairro(nome).slice(0, MAX_PINOS);
  const pontos = [];
  mapProperties.forEach((property, index) => {
    const coord = fuzzyCoords(property);
    if (!coord) return;
    const marker = window.L.marker(coord, {icon: pinIcon(index, index === 0), keyboard: false}).addTo(map);
    marker.on('click mouseover', () => activateMapProperty(index));
    markers.push(marker);
    pontos.push(coord);
  });

  document.querySelectorAll('[data-neighborhood], [data-map-neighborhood]').forEach(b => {
    const alvo = b.dataset.neighborhood || b.dataset.mapNeighborhood;
    b.classList.toggle('active', normalize(alvo) === normalize(nome));
  });

  log(`bairro "${nome}": ${mapProperties.length} imóveis, ${pontos.length} pinos, visível=${map.getContainer().offsetWidth > 0}`);
  if (mapProperties.length) activateMapProperty(0, false);

  if (!pontos.length) return;
  // O mapa nasce escondido (a seção abre na lista de bairros) e o Leaflet não
  // desenha nada com o container de tamanho zero. Enquanto estiver oculto,
  // posiciona sem animar; a animação só vale quando há o que ver.
  const visivel = map.getContainer().offsetWidth > 0;
  if (!visivel) {
    map.setView([centro.lat, centro.lng], 15, {animate: false});
    return;
  }
  map.invalidateSize();
  if (focar) map.flyTo([centro.lat, centro.lng], 15, {duration: .8});
  else map.setView([centro.lat, centro.lng], 15, {animate: false});
}

function pinIcon(index, active = false) {
  return window.L.divIcon({
    className: '',
    html: `<div class="tamada-pin ${active ? 'active' : ''}"><span>${String(index + 1).padStart(2, '0')}</span></div>`,
    iconSize: [42, 48], iconAnchor: [20, 40]
  });
}

/* Diagnóstico sob demanda: só liga com ?debug=1 na URL. Existe porque erro de
   JavaScript numa página estática é invisível — some no console de quem está
   olhando, e quem precisa ver não está com o console aberto. */
const DEBUG = new URLSearchParams(location.search).has('debug');
if (DEBUG) {
  const painel = document.createElement('pre');
  painel.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;max-height:42vh;overflow:auto;margin:0;padding:10px 14px;background:#140f0e;color:#7ef7a0;font:11px/1.5 ui-monospace,monospace;white-space:pre-wrap';
  const escrever = (texto, cor) => {
    const linha = document.createElement('div');
    if (cor) linha.style.color = cor;
    linha.textContent = texto;
    painel.appendChild(linha);
  };
  window.__log = escrever;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(painel));
  window.addEventListener('error', e => escrever(`ERRO: ${e.message}  (${e.filename}:${e.lineno})`, '#ff8a8a'));
  window.addEventListener('unhandledrejection', e => escrever(`PROMISE: ${e.reason}`, '#ff8a8a'));
}
const log = (m, c) => { if (DEBUG && window.__log) window.__log(m, c); };

function initMap() {
  const mapElement = document.querySelector('#propertyMap');
  log(`initMap: Leaflet=${!!window.L} elemento=${!!mapElement} bairros=${bairrosComMapa.length}`);
  if (!window.L || !mapElement) return;
  map = window.L.map(mapElement, {
    center: [-23.555, -46.525],
    zoom: 12,
    // Controles pedidos: botões +/- e zoom pela roda do mouse.
    zoomControl: true,
    scrollWheelZoom: true,
    attributionControl: false,
    // Teto de zoom: os pinos são posições aproximadas dentro do bairro. Deixar
    // chegar em nível de rua sugeriria uma precisão que o dado não tem.
    maxZoom: 16,
    minZoom: 10,
  });
  // `zoomControl: true` acima já cria os botões +/-. Uma segunda chamada a
  // L.control.zoom aqui derrubava o initMap, e como o tileLayer só é adicionado
  // DEPOIS, o mapa ficava sem nenhum tile — a área beje que aparecia.
  const tiles = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '© OpenStreetMap contributors · © CARTO'
  });
  tiles.on('tileerror', () => {
    tileErrors += 1;
    if (tileErrors > 5) mapElement.classList.add('offline');
  });
  // Os tiles entram ANTES de qualquer outra coisa: se algo abaixo falhar, o
  // mapa base já está desenhado em vez de ficar em branco.
  tiles.addTo(map);

  try {
    window.L.control.attribution({prefix: false, position: 'bottomright'}).addTo(map);
  } catch (e) {
    console.warn('[mapa] atribuição não pôde ser adicionada:', e);
  }

  // Abre já num bairro (o de maior volume), com os pinos dele espalhados.
  // O container começa escondido (a seção abre na lista), então aqui só
  // posiciona; o desenho de verdade acontece no showAtlasMap.
  try {
    if (bairrosComMapa.length) mostrarBairroNoMapa(bairrosComMapa[0].nome, false);
  } catch (e) {
    console.warn('[mapa] falha ao desenhar os pinos iniciais:', e);
  }

  // A altura do mapa vem do viewport (100svh - header), então redimensionar a
  // janela muda o container sem o Leaflet perceber.
  addEventListener('resize', () => map?.invalidateSize());
}

function activateMapProperty(index, pan = false) {
  const property = mapProperties[index];
  // `mapProperties` muda a cada troca de bairro e pode ficar vazio entre uma e
  // outra. Sem esta guarda, um índice velho derrubava a página inteira.
  if (!property) return;
  // Sair cedo quando já é o pino ativo. `setIcon` troca o elemento do marcador;
  // o novo nasce embaixo do cursor e dispara `mouseover` de novo, o que
  // realimentava esta função e fazia o card piscar sem parar.
  if (state.activeMapIndex === index) return;
  state.activeMapIndex = index;
  const image = document.querySelector('#mapCardImage');
  image.style.opacity = '0';
  setTimeout(() => { image.src = property.image; image.alt = `${property.title} em ${property.neighborhood}`; image.style.opacity = '1'; }, 150);
  // Era "01 / 12" — parecia dizer que o acervo tem 12 imóveis. Passa a mostrar
  // quantos imóveis existem NAQUELE bairro, que é o número que interessa.
  const totalNoBairro = centroDoBairro.get(normalize(property.neighborhood))?.total;
  document.querySelector('#mapIndex').textContent = totalNoBairro
    ? `${totalNoBairro} ${totalNoBairro === 1 ? 'imóvel' : 'imóveis'} no bairro`
    : '';
  document.querySelector('#mapCardPurpose').textContent = purposeLabel(property);
  document.querySelector('#mapCardLocation').textContent = `${property.neighborhood} · ${property.city}`;
  document.querySelector('#mapCardTitle').textContent = property.title;
  document.querySelector('#mapCardFeatures').innerHTML = specsMarkup(property);
  document.querySelector('#mapCardPrice').textContent = displayPrice(property, property.rent && !property.sale ? 'rent' : 'sale');
  document.querySelector('#mapCardLink').href = `imovel.html?ref=${property.ref}`;
  // Alterna a classe no elemento que já existe em vez de recriar o ícone:
  // `setIcon` substituiria o DOM dos 60 pinos, reiniciando a transição de
  // cada um e piscando o que estivesse sob o cursor.
  markers.forEach((marker, markerIndex) => {
    const pino = marker.getElement()?.querySelector('.tamada-pin');
    if (pino) pino.classList.toggle('active', markerIndex === index);
    else marker.setIcon(pinIcon(markerIndex, markerIndex === index));
  });
  updateMapFavorite();
  document.querySelectorAll('[data-map-neighborhood]').forEach(item => item.classList.toggle('active', normalize(item.dataset.mapNeighborhood) === normalize(property.neighborhood)));
  if (map && pan) map.flyTo(fuzzyCoords(property), Math.max(map.getZoom(), 13), { duration: .7 });
}

/* Mesma guarda do activateMapProperty: entre uma troca de bairro e outra a
   lista pode estar vazia, e ler `.ref` de undefined quebrava a página. */
function imovelAtivoNoMapa() {
  return mapProperties[state.activeMapIndex] || null;
}

function updateMapFavorite() {
  const button = document.querySelector('#mapFavorite');
  const ativo = imovelAtivoNoMapa();
  if (!button || !ativo) return;
  const saved = favorites.has(ativo.ref);
  button.classList.toggle('saved', saved);
  button.innerHTML = `<iconify-icon icon="solar:heart-${saved ? 'bold' : 'linear'}"></iconify-icon>`;
}

document.querySelector('#mapFavorite').addEventListener('click', () => {
  const ativo = imovelAtivoNoMapa();
  if (ativo) toggleFavorite(ativo.ref);
});
document.querySelector('#mapZoomIn').addEventListener('click', () => map?.zoomIn());
document.querySelector('#mapZoomOut').addEventListener('click', () => map?.zoomOut());

/* Bairros com mais imóveis no estoque, com a contagem real. Antes eram os
   bairros dos 12 imóveis fixos — 6 nomes que não representavam o acervo. */
/* Chips de bairro dentro do mapa: os 8 de maior volume, com a contagem.
   Vêm do estoque, não de `mapProperties` — que agora é só o bairro aberto. */
document.querySelector('#mapNeighborhoods').innerHTML = bairrosComMapa.slice(0, 8).map((b, index) =>
  `<button type="button" data-map-neighborhood="${b.nome}" class="${index === 0 ? 'active' : ''}">${b.nome} <i>${b.total}</i></button>`
).join('');
// Chips dentro do próprio mapa: mesma troca de bairro, sem sair da visão.
document.querySelectorAll('[data-map-neighborhood]').forEach(button => button.addEventListener('click', () => {
  mostrarBairroNoMapa(button.dataset.mapNeighborhood, true);
}));

/* Atlas: alterna entre a lista de bairros e o mapa, na mesma seção */
const atlasViewList = document.querySelector('#atlasViewList');
const atlasViewMap = document.querySelector('#atlasViewMap');

const atlasSection = document.querySelector('.atlas-section');

function scrollTargetForAtlasTop() {
  return atlasSection.getBoundingClientRect().top + window.scrollY - 90;
}

/* O mapa encosta na base do header e ocupa o resto da tela. A altura já é
   100svh menos o header (CSS), então basta alinhar o topo — centralizar, como
   era antes, deixava margem em cima e cortava embaixo quando o bloco passava
   da altura da tela. */
function alturaDoHeaderFixo() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-fixo')) || 92;
}

function scrollTargetUnderHeader(element) {
  return element.getBoundingClientRect().top + window.scrollY - alturaDoHeaderFixo();
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

/* `aoMostrar` roda DEPOIS que o mapa já está visível e com tamanho.
   Desenhar os pinos antes disso não funciona: o Leaflet ignora tudo enquanto o
   container tem tamanho zero. */
function showAtlasMap(aoMostrar) {
  swapAtlasView(atlasViewList, atlasViewMap, {
    getScrollTarget: () => scrollTargetUnderHeader(document.querySelector('.map-layout')),
    onShow: () => {
      map?.invalidateSize();
      aoMostrar?.();
    }
  });
}

function showAtlasList() {
  swapAtlasView(atlasViewMap, atlasViewList);
}

document.querySelectorAll('#atlasBack, [data-atlas-back]').forEach(button => button.addEventListener('click', showAtlasList));

/* Lista de bairros do atlas.
   Estava escrita à mão no index.html: 6 bairros com número de POSIÇÃO (02, 03…)
   que parecia contagem de imóveis. Agora vem do estoque real — os de maior
   volume, com a quantidade de verdade. As descrições editoriais existentes são
   preservadas por nome; bairro novo entra sem descrição. */
const listaBairros = document.querySelector('[data-neighborhood]')?.parentElement;
if (listaBairros && bairrosComMapa.length) {
  const descricoes = {};
  listaBairros.querySelectorAll('[data-neighborhood]').forEach(b => {
    const texto = b.querySelector('small')?.textContent?.trim();
    if (texto) descricoes[normalize(b.dataset.neighborhood)] = texto;
  });

  listaBairros.innerHTML = bairrosComMapa.slice(0, 8).map((bairro, i) => {
    const desc = descricoes[normalize(bairro.nome)] || `${bairro.cidade}`;
    return `<button type="button" data-neighborhood="${bairro.nome}"${i === 0 ? ' class="active"' : ''}>`
      + `<span>${bairro.nome}</span><small>${desc}</small>`
      + `<b>${bairro.total}</b></button>`;
  }).join('');
}

document.querySelectorAll('[data-neighborhood]').forEach(button => button.addEventListener('click', () => {
  // Os pinos só são desenhados depois que o mapa aparece — ver showAtlasMap.
  showAtlasMap(() => mostrarBairroNoMapa(button.dataset.neighborhood, true));
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
renderFeaturedGrid();
if (dom.count) dom.count.textContent = catalogProperties.length.toLocaleString('pt-BR');
// O card do mapa é preenchido por mostrarBairroNoMapa, dentro do initMap.
// Havia aqui um activateMapProperty(0) do tempo em que os 12 imóveis existiam
// desde o início; agora `mapProperties` começa vazio e essa chamada lançava
// TypeError, abortando todo o resto do script.
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
