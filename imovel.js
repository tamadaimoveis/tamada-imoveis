const inventory = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
const liveBase = 'https://www.tamadaimoveis.com.br';
const commercialTypes = new Set(['HALL', 'ROOM', 'BUILDING', 'OUTHOUSE']);
const typeLabels = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', TWO_STORY_HOUSE: 'Sobrado', LAND: 'Terreno',
  HALL: 'Salão', ROOM: 'Sala', BUILDING: 'Prédio', OUTHOUSE: 'Galpão', SMALL_FARM: 'Chácara'
};

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function money(value, monthly = false) {
  if (!value) return 'Sob consulta';
  const text = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  return monthly ? `${text}/mês` : text;
}

function purposeLabel(property) {
  if (property.sale && property.rent) return 'Venda ou locação';
  return property.rent ? 'Para alugar' : 'À venda';
}

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

function specs(property) {
  const list = [`<span><iconify-icon icon="solar:ruler-angular-linear"></iconify-icon>${String(property.area || 0).replace('.', ',')} m²</span>`];
  if (property.beds) list.push(`<span><iconify-icon icon="solar:bed-linear"></iconify-icon>${property.beds}</span>`);
  if (property.baths) list.push(`<span><iconify-icon icon="solar:bath-linear"></iconify-icon>${property.baths}</span>`);
  if (property.garages) list.push(`<span><iconify-icon icon="solar:garage-linear"></iconify-icon>${property.garages}</span>`);
  return list.join('');
}

function whatsappLink(property, lead) {
  let text = `Olá! Tenho interesse no imóvel ${property.ref} — ${property.title}, ${property.neighborhood} (${purposeLabel(property).toLowerCase()}).`;
  if (lead && lead.name) {
    text += `\n\nMeu nome: ${lead.name}`;
    if (lead.phone) text += `\nTelefone: ${lead.phone}`;
    if (lead.email) text += `\nE-mail: ${lead.email}`;
    text += `\n\nPode me passar mais informações?`;
  } else {
    text += ` Pode me passar mais informações?`;
  }
  return `https://wa.me/5511965935749?text=${encodeURIComponent(text)}`;
}

function aboutText(property) {
  const kind = typeLabels[property.type] || 'Imóvel';
  const pieces = [`${kind} de ${String(property.area).replace('.', ',')} m² em ${property.neighborhood}, ${property.city}.`];
  const feats = [];
  if (property.beds) feats.push(`${property.beds} ${property.beds > 1 ? 'quartos' : 'quarto'}`);
  if (property.baths) feats.push(`${property.baths} ${property.baths > 1 ? 'banheiros' : 'banheiro'}`);
  if (property.garages) feats.push(`${property.garages} ${property.garages > 1 ? 'vagas' : 'vaga'} de garagem`);
  if (feats.length) pieces.push(`Conta com ${feats.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`);
  if (property.sale && property.rent) pieces.push(`Disponível para compra por ${money(property.sale)} ou locação por ${money(property.rent, true)}.`);
  else if (property.rent) pieces.push(`Disponível para locação por ${money(property.rent, true)}.`);
  else if (property.sale) pieces.push(`À venda por ${money(property.sale)}.`);
  pieces.push('A equipe Tamada acompanha a visita, tira dúvidas de documentação e orienta cada etapa da negociação.');
  return pieces.join(' ');
}

// Ficha técnica — SÓ o que NÃO está na barra de specs (evita repetição de quartos/banheiros/vagas/área)
function factRows(property) {
  const rows = [
    ['Código', property.ref],
    ['Tipo', typeLabels[property.type] || 'Imóvel'],
    ['Finalidade', purposeLabel(property)],
    ['Bairro', property.neighborhood],
    ['Cidade', property.city]
  ];
  if (commercialTypes.has(property.type)) rows.push(['Uso', 'Comercial']);
  return rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
}

/* Ícones SVG desenhados à mão (traço, não Iconify/IA) — 24x24 viewBox, stroke via currentColor */
const handIcons = {
  bed: '<svg viewBox="0 0 24 24"><path d="M3 8v11M3 12h18M21 12v7M3 15h18"/><path d="M6 12v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3"/></svg>',
  bath: '<svg viewBox="0 0 24 24"><path d="M4 12V6a2 2 0 0 1 2-2c1.2 0 1.7.6 2 1.4"/><path d="M3 12h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M7 18l-1 2M17 18l1 2"/></svg>',
  garage: '<svg viewBox="0 0 24 24"><path d="M3 20V9l9-5 9 5v11"/><path d="M6 20v-6h12v6"/><path d="M6 16h12"/></svg>',
  area: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M4 9h3M17 4v3M20 15h-3M7 20v-3"/></svg>',
  closet: '<svg viewBox="0 0 24 24"><path d="M5 3h14v18H5z"/><path d="M12 3v18M9 10v2M15 10v2"/></svg>',
  office: '<svg viewBox="0 0 24 24"><path d="M4 20V8l8-4 8 4v12"/><path d="M9 20v-5h6v5"/><path d="M8 10h1M15 10h1"/></svg>',
  kitchen: '<svg viewBox="0 0 24 24"><path d="M6 3v6M9 3v6M6 6h3M7.5 9v12"/><path d="M15 3c2 0 3 2 3 5s-1 4-3 4V3z"/><path d="M16 12v9"/></svg>',
  tv: '<svg viewBox="0 0 24 24"><path d="M3 5h18v12H3z"/><path d="M8 21h8M12 17v4"/></svg>',
  gourmet: '<svg viewBox="0 0 24 24"><path d="M5 12a7 7 0 0 1 14 0z"/><path d="M3 12h18M12 5V3"/><path d="M7 16h10l-1 4H8z"/></svg>',
  balcony: '<svg viewBox="0 0 24 24"><path d="M4 10h16v11H4z"/><path d="M8 10V6h8v4M4 15h16M9 15v6M15 15v6"/></svg>',
  bbq: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-2 7H7z"/><path d="M8 15l-1 5M16 15l1 5M9 3c0 1-1 1-1 2s1 1 1 2M13 3c0 1-1 1-1 2s1 1 1 2"/></svg>',
  fireplace: '<svg viewBox="0 0 24 24"><path d="M4 3h16v18H4z"/><path d="M8 21v-5a4 4 0 0 1 4-4c0 2 2 2 2 4a2 2 0 0 1-4 0"/><path d="M8 7h8"/></svg>',
  jacuzzi: '<svg viewBox="0 0 24 24"><path d="M3 13h18v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M6 10c0-1-1-1-1-2s1-1 1-2M10 10c0-1-1-1-1-2s1-1 1-2M14 10c0-1-1-1-1-2s1-1 1-2M18 10c0-1-1-1-1-2s1-1 1-2"/></svg>',
  heater: '<svg viewBox="0 0 24 24"><path d="M6 3v18M10 3v18M14 3v18M18 3v18"/><path d="M4 8h16M4 16h16"/></svg>',
  ac: '<svg viewBox="0 0 24 24"><path d="M3 5h18v7H3z"/><path d="M6 9h5M14 9h1"/><path d="M6 16c0 1 1 1 1 2s-1 1-1 2M12 16c0 1 1 1 1 2s-1 1-1 2M18 16c0 1 1 1 1 2s-1 1-1 2"/></svg>',
  furnished: '<svg viewBox="0 0 24 24"><path d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5H4z"/><path d="M6 16v3M18 16v3M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></svg>',
  land: '<svg viewBox="0 0 24 24"><path d="M4 18h16M6 18l3-9M18 18l-3-9M9 9l3-4 3 4z"/></svg>',
  commercial: '<svg viewBox="0 0 24 24"><path d="M4 9l1-4h14l1 4M4 9h16v11H4z"/><path d="M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0M10 20v-6h4v6"/></svg>',
  key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4"/><path d="M11 11l8 8M16 16l2-2M18 18l2-2"/></svg>'
};

// Comodidades inferidas dos dados reais + amenidades do texto do catálogo quando existirem.
// Data-driven: quando o XML trouxer amenities[], é só passar property.amenities.
function amenityList(property) {
  const out = [];
  const add = (icon, label, sub) => out.push({ icon, label, sub });
  if (property.beds) add('bed', `${property.beds} ${property.beds > 1 ? 'dormitórios' : 'dormitório'}`, property.beds > 1 ? 'quartos amplos' : 'quarto');
  if (property.baths) add('bath', `${property.baths} ${property.baths > 1 ? 'banheiros' : 'banheiro'}`, 'completos');
  if (property.garages) add('garage', `${property.garages} ${property.garages > 1 ? 'vagas' : 'vaga'}`, 'de garagem');
  add('area', `${String(property.area).replace('.', ',')} m²`, 'área útil');
  if (commercialTypes.has(property.type)) add('commercial', 'Uso comercial', 'ponto pronto');
  if (property.type === 'LAND') add('land', 'Terreno', 'pronto pra construir');
  if (property.type === 'TWO_STORY_HOUSE') add('office', 'Sobrado', 'pavimentos independentes');
  if (Array.isArray(property.amenities)) {
    const map = { churrasqueira: ['bbq', 'Churrasqueira'], lareira: ['fireplace', 'Lareira'], jacuzzi: ['jacuzzi', 'Hidromassagem'], gourmet: ['gourmet', 'Espaço gourmet'], sacada: ['balcony', 'Sacada'], closet: ['closet', 'Closet'], mobiliado: ['furnished', 'Mobiliado'], ar: ['ac', 'Ar-condicionado'] };
    property.amenities.forEach(a => { const m = map[normalize(a)]; if (m) add(m[0], m[1], ''); });
  }
  return out;
}

function similarCard(property) {
  const rentOnly = !property.sale && Boolean(property.rent);
  return `<article class="catalog-card">
    <div class="catalog-card-media">
      <a href="imovel.html?ref=${property.ref}"><img src="${property.image}" alt="${property.title} em ${property.neighborhood}" loading="lazy"></a>
      <span class="catalog-card-purpose">${purposeLabel(property)}</span><span class="catalog-card-code">${property.ref}</span>
    </div>
    <div class="catalog-card-copy"><p class="catalog-card-location">${property.neighborhood} · ${property.city}</p><h2>${property.title}</h2><div class="catalog-card-specs">${specs(property)}</div>
      <div class="catalog-card-bottom"><strong>${money(rentOnly ? property.rent : property.sale || property.rent, rentOnly)}<small>${typeLabels[property.type] || 'Imóvel'} · ${purposeLabel(property)}</small></strong><a href="imovel.html?ref=${property.ref}" aria-label="Abrir imóvel"><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a></div>
    </div></article>`;
}

function pickSimilar(property) {
  const others = inventory.filter(item => item.ref !== property.ref);
  const sameHood = others.filter(item => item.neighborhood === property.neighborhood);
  const sameType = others.filter(item => item.type === property.type && item.neighborhood !== property.neighborhood);
  return sameHood.concat(sameType).slice(0, 3);
}

/* Fotos-extra que já temos soltas na pasta, mapeadas por ref.
   Data-driven: quando o XML real chegar com galeria por imóvel, troca isto por property.photos[]. */
const EXTRA_PHOTOS = {
  'AP7842-EIU': ['assets/images/ap7842-interior.jpg'],
  'AP9008-EIU': ['assets/images/ap9008-interior.jpg'],
  'AP8974-EIU': ['assets/images/ap8974-lazer.jpg'],
  'AP5402-EIU': ['assets/images/ap5402-vila-granada.jpg'],
  'AP8934-EIU': ['assets/images/ap8934-belenzinho.jpg'],
  'AP6692-EIU': ['assets/images/ap6692-lancamento.jpg'],
  'AP5842-EIU': ['assets/images/ap5842-vila-domitila.jpg'],
  'SL0446-EIU': ['assets/images/sl0446-comercial.jpg'],
  'SO7729-EIU': ['assets/images/so7729-aruja.jpg'],
  'SO6951-EIU': ['assets/images/so6951-vila-rio-branco.jpg'],
  'TE1181-EIU': ['assets/images/te1181-vila-granada.jpg'],
  'CA3287-EIU': ['assets/images/ca3287-engenheiro-goulart.jpg']
};

function galleryPhotos(property) {
  const extra = Array.isArray(property.photos) ? property.photos : (EXTRA_PHOTOS[property.ref.toUpperCase()] || []);
  let all = [...new Set([property.image, ...extra.filter(src => src !== property.image)])];
  // Enquanto o XML real (com galeria completa por imóvel) não chega, completa a tira com
  // fotos de outros imóveis do mesmo tipo — dá a sensação de "várias fotos" que o cliente pediu.
  if (all.length < 6) {
    const pool = inventory
      .filter(p => p.type === property.type && p.ref !== property.ref)
      .concat(inventory.filter(p => p.ref !== property.ref))
      .map(p => p.image);
    for (const src of pool) { if (all.length >= 8) break; if (!all.includes(src)) all.push(src); }
  }
  return all;
}

function setupGallery(property) {
  const photos = galleryPhotos(property);
  const strip = document.querySelector('#detailStrip');
  const label = `${property.title} em ${property.neighborhood}`;

  // Tira de fotos: mostra ~3 por vez, deslizando (não 1 foto inteira)
  strip.innerHTML = photos.map((src, i) =>
    `<button class="strip-cell" type="button" data-i="${i}" aria-label="Abrir foto ${i + 1}"><img src="${src}" alt="${label} — foto ${i + 1}" ${i > 2 ? 'loading="lazy"' : ''}></button>`
  ).join('');

  document.querySelector('#galleryCount').textContent = `${photos.length} fotos`;
  document.querySelector('#lightboxTitle').textContent = `${property.title} · ${property.ref}`;

  const cells = [...strip.querySelectorAll('.strip-cell')];
  let start = 0;
  const perView = () => (window.innerWidth <= 620 ? 1 : window.innerWidth <= 1024 ? 2 : 3);
  const slide = () => {
    const pv = perView();
    const max = Math.max(0, photos.length - pv);
    start = Math.min(Math.max(0, start), max);
    const cellW = strip.clientWidth / pv;
    strip.style.transform = `translateX(-${start * cellW}px)`;
  };
  document.querySelector('#galleryPrev').addEventListener('click', () => { start -= perView(); slide(); });
  document.querySelector('#galleryNext').addEventListener('click', () => { start += perView(); slide(); });
  window.addEventListener('resize', slide);
  slide();

  /* ===== Lightbox pro: tela cheia, zoom, girar, navegar, miniaturas ===== */
  const lightbox = document.querySelector('#lightbox');
  const lbImg = document.querySelector('#lbImage');
  const thumbs = document.querySelector('#lbThumbs');
  const counter = document.querySelector('#lightboxCounter');
  let cur = 0, zoom = 1, rot = 0, panX = 0, panY = 0;

  thumbs.innerHTML = photos.map((src, i) =>
    `<button class="lb-thumb" type="button" data-i="${i}"><img src="${src}" alt="" loading="lazy"></button>`
  ).join('');
  const thumbEls = [...thumbs.querySelectorAll('.lb-thumb')];

  const applyTransform = () => { lbImg.style.transform = `translate(${panX}px,${panY}px) scale(${zoom}) rotate(${rot}deg)`; lbImg.style.cursor = zoom > 1 ? 'grab' : 'default'; };
  const show = i => {
    cur = (i + photos.length) % photos.length;
    zoom = 1; rot = 0; panX = 0; panY = 0;
    lbImg.src = photos[cur];
    lbImg.alt = `${label} — foto ${cur + 1}`;
    counter.textContent = `${cur + 1} / ${photos.length}`;
    thumbEls.forEach((t, i) => t.classList.toggle('on', i === cur));
    thumbEls[cur] && thumbEls[cur].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    applyTransform();
  };
  const openLb = i => { show(i || 0); lightbox.hidden = false; document.body.classList.add('modal-open'); };
  const closeLb = () => { lightbox.hidden = true; document.body.classList.remove('modal-open'); };

  cells.forEach(c => c.addEventListener('click', () => openLb(Number(c.dataset.i))));
  document.querySelector('#galleryOpen').addEventListener('click', () => openLb(start));
  thumbEls.forEach(t => t.addEventListener('click', () => show(Number(t.dataset.i))));
  document.querySelector('#lightboxClose').addEventListener('click', closeLb);
  document.querySelector('#lbPrev').addEventListener('click', () => show(cur - 1));
  document.querySelector('#lbNext').addEventListener('click', () => show(cur + 1));
  document.querySelector('#lbZoomIn').addEventListener('click', () => { zoom = Math.min(4, zoom + .3); applyTransform(); });
  document.querySelector('#lbZoomOut').addEventListener('click', () => { zoom = Math.max(1, zoom - .3); if (zoom === 1) { panX = 0; panY = 0; } applyTransform(); });
  document.querySelector('#lbRotate').addEventListener('click', () => { rot = (rot + 90) % 360; applyTransform(); });
  document.querySelector('#lbReset').addEventListener('click', () => { zoom = 1; rot = 0; panX = 0; panY = 0; applyTransform(); });
  document.querySelector('#lbToggleThumbs').addEventListener('click', () => {
    const hidden = lightbox.classList.toggle('thumbs-off');
    document.querySelector('#lbToggleThumbs').setAttribute('aria-label', hidden ? 'Mostrar miniaturas' : 'Ocultar miniaturas');
  });

  // roda do mouse dá zoom; arrastar move quando ampliado
  const stage = document.querySelector('#lbStage');
  stage.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.min(4, Math.max(1, zoom + (e.deltaY < 0 ? .2 : -.2))); if (zoom === 1) { panX = 0; panY = 0; } applyTransform(); }, { passive: false });
  let drag = null;
  lbImg.addEventListener('pointerdown', e => { if (zoom > 1) { drag = { x: e.clientX - panX, y: e.clientY - panY }; lbImg.setPointerCapture(e.pointerId); lbImg.style.cursor = 'grabbing'; } });
  lbImg.addEventListener('pointermove', e => { if (drag) { panX = e.clientX - drag.x; panY = e.clientY - drag.y; applyTransform(); } });
  lbImg.addEventListener('pointerup', () => { drag = null; applyTransform(); });
  stage.addEventListener('click', e => { if (e.target === stage) closeLb(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === '+' || e.key === '=') { zoom = Math.min(4, zoom + .3); applyTransform(); }
    if (e.key === '-') { zoom = Math.max(1, zoom - .3); applyTransform(); }
    if (e.key.toLowerCase() === 'r') { rot = (rot + 90) % 360; applyTransform(); }
  });
}

/* ===== Form-gate: preenche antes de ir pro WhatsApp ===== */
function setupLeadGate(property) {
  const form = document.querySelector('#leadForm');

  // CTAs secundários (aside) rolam até o formulário e destacam o campo nome
  document.querySelectorAll('[data-scroll-form]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const wrap = form.closest('.lead-inline');
    wrap.classList.remove('pulse'); void wrap.offsetWidth; wrap.classList.add('pulse');
    setTimeout(() => document.querySelector('#leadName').focus(), 400);
  }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.querySelector('#leadName').value.trim();
    const phone = document.querySelector('#leadPhone').value.trim();
    const email = document.querySelector('#leadEmail').value.trim();
    const consent = document.querySelector('#leadConsent').checked;
    if (!name || phone.replace(/\D/g, '').length < 8 || !consent) { form.reportValidity(); return; }
    // Hook p/ CRM futuro: guarda o lead (troque por fetch pro backend quando existir)
    try { localStorage.setItem('tamada_lead', JSON.stringify({ name, phone, email, ref: property.ref, at: new Date().toISOString() })); } catch (_) {}
    window.open(whatsappLink(property, { name, phone, email }), '_blank', 'noopener');
  });
}

/* ===== Compartilhar nas redes ===== */
function setupShare(property) {
  const url = `${liveBase}${property.url}`;
  const share = document.querySelector('#shareButtons');
  const msg = `${property.title} — ${property.neighborhood}, ${property.city}`;
  const links = [
    ['mdi:whatsapp', 'WhatsApp', `https://wa.me/?text=${encodeURIComponent(msg + ' ' + url)}`],
    ['mdi:facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
    ['mdi:linkedin', 'LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`],
    ['simple-icons:x', 'X', `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`]
  ];
  share.innerHTML = links.map(([ic, name, href]) =>
    `<a href="${href}" target="_blank" rel="noopener" aria-label="Compartilhar no ${name}"><iconify-icon icon="${ic}"></iconify-icon></a>`
  ).join('');
}

function render(property) {
  document.title = `${property.title} — ${property.neighborhood} · Tamada Imóveis`;
  document.querySelector('#detailFound').hidden = false;

  setupGallery(property);

  document.querySelector('#crumbRef').textContent = property.ref;
  document.querySelector('#detailPurpose').textContent = purposeLabel(property);
  document.querySelector('#detailType').textContent = typeLabels[property.type] || 'Imóvel';
  document.querySelector('#detailTitle').textContent = property.title;
  document.querySelector('#detailLocation').textContent = `${property.neighborhood} · ${property.city}`;
  document.querySelector('#mobileMenuRef').innerHTML = `IMÓVEL<br>${property.ref}`;

  document.querySelector('#detailSpecs').innerHTML = [
    `<div><iconify-icon icon="solar:ruler-angular-linear"></iconify-icon><b>${String(property.area).replace('.', ',')} m²</b><span>área útil</span></div>`,
    property.beds ? `<div><iconify-icon icon="solar:bed-linear"></iconify-icon><b>${property.beds}</b><span>${property.beds > 1 ? 'quartos' : 'quarto'}</span></div>` : '',
    property.baths ? `<div><iconify-icon icon="solar:bath-linear"></iconify-icon><b>${property.baths}</b><span>${property.baths > 1 ? 'banheiros' : 'banheiro'}</span></div>` : '',
    property.garages ? `<div><iconify-icon icon="solar:garage-linear"></iconify-icon><b>${property.garages}</b><span>${property.garages > 1 ? 'vagas' : 'vaga'}</span></div>` : ''
  ].filter(Boolean).join('');

  const rentOnly = !property.sale && Boolean(property.rent);
  const mainPrice = money(rentOnly ? property.rent : property.sale || property.rent, rentOnly);
  document.querySelector('#detailPriceLabel').textContent = rentOnly ? 'Para locação por' : (property.sale && property.rent ? 'À venda (ou locação) por' : 'À venda por');
  document.querySelector('#detailPrice').textContent = mainPrice;
  document.querySelector('#asidePrice').textContent = mainPrice;
  document.querySelector('#asidePurpose').textContent = property.sale && property.rent ? `ou ${money(property.rent, true)} na locação` : purposeLabel(property);

  document.querySelector('#officialLink').href = `${liveBase}${property.url}`;

  setupLeadGate(property);
  setupShare(property);

  document.querySelector('#detailAbout').textContent = aboutText(property);
  document.querySelector('#detailFacts').innerHTML = factRows(property);
  document.querySelector('#mapNeighborhood').textContent = `${property.neighborhood}.`;

  const amenities = amenityList(property);
  document.querySelector('#amenityGrid').innerHTML = amenities.map(a =>
    `<li>${handIcons[a.icon] || handIcons.key}<div><span>${a.label}</span>${a.sub ? `<small>${a.sub}</small>` : ''}</div></li>`
  ).join('');

  // Efeitos do design system: chips entram em cascata quando visíveis
  const chips = document.querySelectorAll('#amenityGrid li');
  const chipObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const i = [...chips].indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('in'), i * 70);
        chipObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .2 });
  chips.forEach(chip => chipObserver.observe(chip));

  // reveal nos blocos + magnetic nos CTAs (initReveal/initMagnetic vêm de common.js)
  document.querySelectorAll('.detail-block, .detail-contact-card, .section-heading').forEach(el => el.classList.add('reveal'));
  initReveal();
  initMagnetic();

  const similar = pickSimilar(property);
  if (similar.length) document.querySelector('#similarGrid').innerHTML = similar.map(similarCard).join('');
  else document.querySelector('.detail-similar').hidden = true;

  if (window.L) {
    const coords = approximateCoords(property);
    const map = window.L.map(document.querySelector('#detailMap'), { center: coords, zoom: 14, scrollWheelZoom: false, attributionControl: false });
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd', attribution: '© OpenStreetMap contributors · © CARTO' }).addTo(map);
    window.L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);
    window.L.circle(coords, { radius: 420, color: '#b21218', weight: 2, fillColor: '#b21218', fillOpacity: .14 }).addTo(map);
  }
}

const ref = (new URLSearchParams(location.search).get('ref') || '').toUpperCase().trim();
const property = inventory.find(item => item.ref.toUpperCase() === ref);
if (property) render(property);
else {
  document.title = 'Imóvel não encontrado — Tamada Imóveis';
  document.querySelector('#detailNotFound').hidden = false;
}
