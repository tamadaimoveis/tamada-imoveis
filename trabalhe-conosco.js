/* trabalhe-conosco.js — vitrine de 3 imoveis reais do catalogo + formulario de candidatura.
   Formulario e placeholder ate o Sanity CMS ser plugado (ver docs/superpowers/specs/2026-07-26-trabalhe-conosco-design.md
   e memoria de projeto tamada-plano-sanity-futuro): grava so em localStorage, sem redirecionar pro WhatsApp.
   Menu/scroll/reveal/magnetic/ano vem de common.js. */

const SHOWCASE_REFS = ['SO7729-EIU', 'AP7842-EIU', 'CA2842-EIU'];

const TYPE_LABELS = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', TWO_STORY_HOUSE: 'Sobrado', LAND: 'Terreno',
  HALL: 'Salão', ROOM: 'Sala', BUILDING: 'Prédio', OUTHOUSE: 'Galpão', SMALL_FARM: 'Chácara'
};

function money(value, monthly = false) {
  if (!value) return 'Sob consulta';
  const text = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  return monthly ? `${text}/mês` : text;
}

function purposeLabel(property) {
  if (property.sale && property.rent) return 'Venda ou locação';
  return property.rent ? 'Para alugar' : 'À venda';
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
  return `<article class="catalog-card" data-ref="${property.ref}">
    <div class="catalog-card-media">
      <a href="imovel.html?ref=${property.ref}"><img src="${property.image}" alt="${property.title} em ${property.neighborhood}" loading="lazy"></a>
      <span class="catalog-card-purpose">${purposeLabel(property)}</span><span class="catalog-card-code">${property.ref}</span>
    </div>
    <div class="catalog-card-copy"><p class="catalog-card-location">${property.neighborhood} · ${property.city}</p><h2>${property.title}</h2><div class="catalog-card-specs">${specs(property)}</div>
      <div class="catalog-card-bottom"><strong>${money(rentOnly ? property.rent : property.sale || property.rent, rentOnly)}<small>${TYPE_LABELS[property.type] || 'Imóvel'} · ${purposeLabel(property)}</small></strong><a href="imovel.html?ref=${property.ref}" aria-label="Abrir imóvel"><iconify-icon icon="solar:arrow-up-right-linear"></iconify-icon></a></div>
    </div></article>`;
}

function renderShowcase() {
  const inventory = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
  const grid = document.querySelector('#recruitShowcase');
  const picked = SHOWCASE_REFS.map(ref => inventory.find(p => p.ref === ref)).filter(Boolean);
  grid.innerHTML = picked.map(card).join('');
}
renderShowcase();

/* ===== Formulario de candidatura (placeholder ate o Sanity) ===== */
const form = document.querySelector('#recruitForm');
const success = document.querySelector('#recruitSuccess');
const val = id => (document.querySelector(id).value || '').trim();

form.addEventListener('submit', e => {
  e.preventDefault();

  const name = val('#rcName');
  const phone = val('#rcPhone');
  const email = val('#rcEmail');
  const status = val('#rcStatus');
  const consent = document.querySelector('#rcConsent').checked;

  if (!name || phone.replace(/\D/g, '').length < 8 || !email.includes('@') || !status || !consent) {
    form.reportValidity();
    return;
  }

  const creci = val('#rcCreci');
  const region = val('#rcRegion');
  const experience = val('#rcExperience');

  // Hook p/ Sanity futuro — por enquanto so guarda local, sem back-end.
  try {
    localStorage.setItem('tamada_recruit', JSON.stringify({ name, phone, email, status, creci, region, experience, at: new Date().toISOString() }));
  } catch (_) {}

  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
