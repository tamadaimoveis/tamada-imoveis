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

/* Descrição escrita pelo corretor, vinda do cadastro. Antes este bloco montava
   um texto genérico a partir de quartos/preço — texto de template, igual em
   todo imóvel. O texto real vem com quebras de parágrafo, então é renderizado
   como HTML em vez de textContent. */
function aboutHtml(property) {
  const texto = (property.descricao || '').trim();
  if (!texto) return '';
  return texto
    .split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p).replace(/\r?\n/g, '<br>')}</p>`)
    .join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Ficha técnica — SÓ o que NÃO está na barra de specs (evita repetição de quartos/banheiros/vagas/área)
/* Ficha técnica: SÓ o que não aparece em outro lugar da página.
   Ficam de fora de propósito, porque já são exibidos acima:
     área útil, quartos, banheiros, vagas → barra de specs
     tipo, finalidade                     → selos abaixo do título
     bairro, cidade                       → linha de localização
     código                               → breadcrumb e selo na foto
     acabamentos                          → bloco "Características"
   Repetir tudo isso deixava a tabela longa e sem função. Linha sem valor
   também não entra — imóvel sem condomínio não exibe "Condomínio: —". */
function factRows(property) {
  const f = property.ficha || {};
  const m2 = v => `${String(v).replace('.', ',')} m²`;
  const brl = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const vagas = [
    f.vagasCobertas ? `${f.vagasCobertas} coberta${f.vagasCobertas > 1 ? 's' : ''}` : null,
    f.vagasDescobertas ? `${f.vagasDescobertas} descoberta${f.vagasDescobertas > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ');

  const rows = [
    // Custo mensal — o que decide a compra e não está em lugar nenhum
    ['Condomínio', f.condominio ? `${brl(f.condominio)}/mês` : null],
    ['IPTU', f.iptu ? brl(f.iptu) : null],
    ['Preço à vista', f.precoAVista ? brl(f.precoAVista) : null],
    ['Valor do m²', f.precoM2 ? brl(f.precoM2) : null],
    ['Aceita negociação', f.aceitaNegociacao ? 'Sim' : null],
    ['Formas de pagamento', (property.pagamento || []).join(' · ') || null],
    ['Garantias aceitas', (property.garantias || []).join(' · ') || null],
    // Prédio e posição da unidade
    ['Andar', f.andar],
    ['Andares no prédio', f.andaresPredio],
    ['Elevadores', f.elevadores],
    ['Pé-direito', f.peDireito ? `${String(f.peDireito).replace('.', ',')} m` : null],
    // Medidas e cômodos que a barra de specs não mostra
    ['Área total', f.areaTotal && f.areaTotal !== f.areaUtil ? m2(f.areaTotal) : null],
    ['Suítes', f.suites],
    ['Salas', f.salas],
    ['Distribuição das vagas', vagas || null],
    ['Tipo de vaga', f.tipoVaga],
    // Idade e estado
    ['Ano de construção', f.anoConstrucao],
    ['Ano da reforma', f.anoReforma],
    ['Estágio da obra', f.obra],
    ['Ocupação', f.ocupacao],
    ['Imóvel locado', f.locado ? 'Sim' : null],
    ['Exclusividade', f.exclusividade ? 'Sim' : null],
    ['Zoneamento', f.zoneamento],
    // Endereço, número, CEP e coordenadas NÃO entram — nem aqui nem no JSON que
    // alimenta esta página. Localização pública é só bairro e cidade.
  ];

  return rows
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && value !== 0)
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(String(value))}</dd></div>`)
    .join('');
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
  key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4"/><path d="M11 11l8 8M16 16l2-2M18 18l2-2"/></svg>',
  /* Traço contínuo, mesmo peso dos acima — desenhados para as comodidades que
     vieram do cadastro real. */
  pool: '<svg viewBox="0 0 24 24"><path d="M2 18c1.5 0 1.5 1.5 3 1.5S6.5 18 8 18s1.5 1.5 3 1.5S12.5 18 14 18s1.5 1.5 3 1.5S18.5 18 20 18"/><path d="M7 15V6a2 2 0 0 1 4 0v9M13 15V6a2 2 0 0 1 4 0v9M7 9h4M13 9h4"/></svg>',
  gym: '<svg viewBox="0 0 24 24"><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/></svg>',
  sauna: '<svg viewBox="0 0 24 24"><path d="M8 3c0 2-2 2.5-2 4.5S8 10 8 12M12 3c0 2-2 2.5-2 4.5S12 10 12 12M16 3c0 2-2 2.5-2 4.5S16 10 16 12"/><path d="M4 16h16v4H4z"/></svg>',
  wine: '<svg viewBox="0 0 24 24"><path d="M8 3h8l-1 6a3 3 0 0 1-6 0z"/><path d="M12 12v7M9 21h6"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  elevator: '<svg viewBox="0 0 24 24"><path d="M5 3h14v18H5z"/><path d="M12 3v18M9 9l-1.5-2L6 9M15 15l1.5 2L18 15"/></svg>',
  garden: '<svg viewBox="0 0 24 24"><path d="M12 21V10"/><path d="M12 14c-4 0-6-2-6-5 3 0 6 1 6 5zM12 12c4 0 6-2 6-5-3 0-6 1-6 5z"/><path d="M5 21h14"/></svg>',
  security: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9.5 12l2 2 3.5-4"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M4 20v-6M20 20v-6M4 14h16"/><path d="M8 14V7l8-3v10"/><circle cx="8" cy="7" r="0"/></svg>',
  sport: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3.5"/></svg>',
  party: '<svg viewBox="0 0 24 24"><path d="M4 20l6-14 8 8z"/><path d="M14 4l1 2M18 3l-1 3M20 8l-3 1"/></svg>',
  cinema: '<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z"/><path d="M3 10h18M7 6v4M12 6v4M17 6v4"/><path d="M10 13l4 2-4 2z"/></svg>',
  pet: '<svg viewBox="0 0 24 24"><circle cx="8" cy="7" r="2"/><circle cx="16" cy="7" r="2"/><circle cx="5" cy="13" r="2"/><circle cx="19" cy="13" r="2"/><path d="M12 12c-3 0-5 2.5-5 5a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3c0-2.5-2-5-5-5z"/></svg>',
  solar: '<svg viewBox="0 0 24 24"><path d="M13 2L5 13h6l-2 9 8-11h-6z"/></svg>',
  water: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>'
};

/* Ícone por comodidade. Sem match cai no genérico `check` — melhor um ícone
   neutro do que esconder uma comodidade que o imóvel realmente tem. */
const ICONE_COMODIDADE = {
  'Piscina': 'pool', 'Piscina Infantil': 'pool', 'Piscina Térmica': 'pool',
  'Churrasqueira': 'bbq', 'Espaço Gourmet': 'gourmet', 'Varanda Gourmet': 'gourmet',
  'Academia': 'gym', 'Sauna': 'sauna', 'Hidromassagem': 'jacuzzi',
  'Lareira': 'fireplace', 'Adega': 'wine',
  'Sacada / Varanda': 'balcony', 'Terraço': 'balcony', 'Solário': 'sun',
  'Closet': 'closet', 'Mobiliado': 'furnished', 'Semimobiliado': 'furnished',
  'Ar Condicionado': 'ac', 'Elevador': 'elevator',
  'Garagem Coberta': 'garage', 'Quintal': 'garden', 'Área Verde': 'garden',
  'Portaria 24h': 'security', 'Segurança 24h': 'security', 'Câmeras (CFTV)': 'security',
  'Alarme': 'security', 'Interfone': 'security', 'Portão Eletrônico': 'security',
  'Condomínio Fechado': 'security', 'Zelador': 'security',
  'Playground': 'play', 'Brinquedoteca': 'play', 'Salão de Jogos': 'play',
  'Quadra Poliesportiva': 'sport', 'Campo de Futebol': 'sport',
  'Salão de Festas': 'party', 'Área de Lazer': 'party', 'Cinema': 'cinema',
  'Escritório': 'office', 'Coworking': 'office',
  'Aceita Pet': 'pet', 'Pet Place': 'pet',
  'Energia Solar': 'solar', 'Água': 'water', 'Esgoto': 'water',
  'Energia Elétrica': 'solar', 'TV a Cabo': 'tv',
};

/* Comodidades reais do imóvel. Antes esta lista era inventada a partir de
   quartos/banheiros/vagas — dado que já aparece na barra de specs e na ficha
   técnica, repetido aqui como se fosse diferencial. Agora só entra o que o
   imóvel de fato tem cadastrado. */
function amenityList(property) {
  const itens = [...(property.comodidades || [])];
  // Acabamento não é comodidade, mas é diferencial de verdade e o cliente pediu
  // que nada ficasse de fora.
  for (const a of property.acabamentos || []) itens.push(`Piso ${a}`);
  return itens.map(label => ({
    icon: ICONE_COMODIDADE[label] || 'check',
    label,
    sub: '',
  }));
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
  // Lido aqui, não capturado no topo do arquivo: catalog-data.js (2,2 MB)
  // agora carrega depois de imovel.js de propósito (ver imovel.html), então
  // window.TAMADA_CATALOG só existe a partir deste ponto — capturar antes
  // sempre pegaria vazio. Se ainda não chegou, a seção de parecidos some
  // (comportamento já existente mais abaixo), sem quebrar nada.
  const inventory = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
  const others = inventory.filter(item => item.ref !== property.ref);
  const sameHood = others.filter(item => item.neighborhood === property.neighborhood);
  const sameType = others.filter(item => item.type === property.type && item.neighborhood !== property.neighborhood);
  return sameHood.concat(sameType).slice(0, 3);
}

/* Redimensiona no CDN do Sanity. A tira mostra miniaturas e o lightbox mostra
   grande — pedir o mesmo arquivo pros dois desperdiça banda em imóvel com 40
   fotos. URL que não é do Sanity (asset local) passa intacta. */
function sized(src, w) {
  if (!src || !src.includes('cdn.sanity.io')) return src;
  return `${src.split('?')[0]}?w=${w}&auto=format&fit=max`;
}

/* Registro completo do imóvel — arquivo estático gerado por
   site/scripts/gerar-catalogo.mjs, um por imóvel (poucos KB). Fonte ÚNICA
   desta página: título, preço, specs, fotos, descrição, comodidades, ficha
   técnica — tudo. Só window.TAMADA_CATALOG (2,2 MB) fica de fora, usado
   depois, exclusivamente para sugerir "imóveis parecidos".

   Não consulta o Sanity direto porque o navegador esbarraria em CORS (a origem
   do site precisaria ser liberada no projeto) e somaria latência a cada
   abertura. E não cabe no catalog-data.js: descrição + 22 fotos + comodidades
   de 4.429 imóveis dariam dezenas de MB para todo visitante. */
async function carregarImovel(ref) {
  // window.__imovelPromise (script inline no <body>) já disparou este mesmo
  // fetch bem mais cedo — reaproveita em vez de pedir de novo.
  if (window.__imovelPromise) return window.__imovelPromise;
  try {
    const res = await fetch(`imovel/${encodeURIComponent(ref)}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function galleryPhotos(property) {
  // `photos` vem de carregarFotos(). Sem completar com foto de outro imóvel —
  // agora que a galeria real existe, foto alheia induz o comprador a erro.
  const extra = Array.isArray(property.photos) ? property.photos : [];
  // Dedup pela URL SEM query string: a capa chega recortada para o card
  // (?w=560&h=400) e a mesma foto vem crua na galeria — comparar a URL inteira
  // deixava a primeira foto aparecer duas vezes.
  const vistos = new Set();
  const out = [];
  for (const src of [property.image, ...extra]) {
    if (!src) continue;
    const base = src.split('?')[0];
    if (vistos.has(base)) continue;
    vistos.add(base);
    out.push(src);
  }
  return out;
}

/* youtu.be/ID e youtube.com/watch?v=ID → URL de embed. Devolve null em URL que
   não seja YouTube, para não montar iframe de origem desconhecida. */
function youtubeEmbed(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0` : null;
}

/* Vídeo e tour 360°: 2.842 imóveis têm vídeo e 29 têm tour no cadastro.
   O player só é criado no clique — o iframe do YouTube carrega ~1 MB de
   script, e embutir isso em toda visita derrubaria a velocidade do site. */
function setupMedia(property) {
  const modal = document.querySelector('#mediaModal');
  const stage = document.querySelector('#mediaModalStage');
  const titulo = document.querySelector('#mediaModalTitle');
  const btnVideo = document.querySelector('#videoOpen');
  const btnTour = document.querySelector('#tourOpen');
  if (!modal) return;

  const embedVideo = youtubeEmbed(property.video);
  // Vídeo repetido em centenas de imóveis é o institucional da Tamada, não a
  // filmagem desta casa — o rótulo avisa antes do clique.
  const institucional = property.videoInstitucional === true;
  if (btnVideo) {
    btnVideo.hidden = !embedVideo;
    btnVideo.querySelector('span')?.remove();
    const txt = institucional ? 'Conheça a Tamada' : 'Vídeo';
    btnVideo.lastChild.textContent = ` ${txt}`;
  }
  if (btnTour) btnTour.hidden = !property.tour;

  const abrir = (src, rotulo, ehTour) => {
    // innerHTML novo a cada abertura: garante que o player anterior morreu.
    stage.innerHTML = `<iframe src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen title="${rotulo}"></iframe>`;
    titulo.textContent = rotulo;
    modal.classList.toggle('is-tour', !!ehTour);
    modal.hidden = false;
    document.body.classList.add('modal-open');
  };

  const fechar = () => {
    modal.hidden = true;
    // Zera o palco para parar o áudio — só esconder o modal deixa tocando.
    stage.innerHTML = '';
    document.body.classList.remove('modal-open');
  };

  if (embedVideo) {
    const rotulo = institucional ? 'Conheça a Tamada Imóveis' : 'Vídeo do imóvel';
    btnVideo.addEventListener('click', () => abrir(embedVideo, rotulo, false));
  }
  if (property.tour) btnTour.addEventListener('click', () => abrir(property.tour, 'Tour virtual 360°', true));
  document.querySelector('#mediaModalClose').addEventListener('click', fechar);
  modal.addEventListener('click', e => { if (e.target === modal) fechar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) fechar(); });
}

function setupGallery(property) {
  const photos = galleryPhotos(property);
  const strip = document.querySelector('#detailStrip');
  const label = `${property.title} em ${property.neighborhood}`;

  // Tira de fotos: mostra ~3 por vez, deslizando (não 1 foto inteira)
  strip.innerHTML = photos.map((src, i) =>
    `<button class="strip-cell" type="button" data-i="${i}" aria-label="Abrir foto ${i + 1}"><img src="${sized(src, 640)}" alt="${label} — foto ${i + 1}" width="640" height="480" ${i > 2 ? 'loading="lazy"' : 'fetchpriority="high"'}></button>`
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
    `<button class="lb-thumb" type="button" data-i="${i}"><img src="${sized(src, 200)}" alt="" width="200" height="150" loading="lazy"></button>`
  ).join('');
  const thumbEls = [...thumbs.querySelectorAll('.lb-thumb')];

  const applyTransform = () => { lbImg.style.transform = `translate(${panX}px,${panY}px) scale(${zoom}) rotate(${rot}deg)`; lbImg.style.cursor = zoom > 1 ? 'grab' : 'default'; };
  const show = i => {
    cur = (i + photos.length) % photos.length;
    zoom = 1; rot = 0; panX = 0; panY = 0;
    lbImg.src = sized(photos[cur], 1600);
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
  setupMedia(property);

  // Descrição do corretor. O título deste bloco era fixo ("Um imóvel com a cara
  // do bairro") — texto de template repetido em 4.429 páginas, o que também
  // penaliza SEO por conteúdo duplicado. Passa a nomear o imóvel de fato.
  const sobre = aboutHtml(property);
  const blocoSobre = document.querySelector('#detailAbout').closest('.detail-block');
  if (sobre) {
    document.querySelector('#detailAbout').innerHTML = sobre;
    document.querySelector('#aboutTitle').innerHTML =
      `${escapeHtml(typeLabels[property.type] || 'Imóvel')} em<br><em>${escapeHtml(property.neighborhood)}.</em>`;
  } else if (blocoSobre) {
    blocoSobre.hidden = true;
  }

  // Agora que a ficha só traz o que não está em outro lugar, ela pode ficar
  // vazia num imóvel de cadastro enxuto — nesse caso o bloco inteiro sai.
  const linhasFicha = factRows(property);
  const blocoFicha = document.querySelector('#detailFacts').closest('.detail-block');
  document.querySelector('#detailFacts').innerHTML = linhasFicha;
  if (blocoFicha) blocoFicha.hidden = !linhasFicha;

  document.querySelector('#mapNeighborhood').textContent = `${property.neighborhood}.`;

  const amenities = amenityList(property);
  // Imóvel sem comodidade cadastrada (213 dos 4.429) não deve exibir um bloco
  // com título e grade vazia embaixo.
  const blocoAmenities = document.querySelector('#amenitiesBlock');
  if (!amenities.length) {
    if (blocoAmenities) blocoAmenities.hidden = true;
  } else if (blocoAmenities) {
    blocoAmenities.hidden = false;
  }
  document.querySelector('#amenityGrid').innerHTML = amenities.map(a =>
    `<li>${handIcons[a.icon] || handIcons.check}<div><span>${escapeHtml(a.label)}</span>${a.sub ? `<small>${escapeHtml(a.sub)}</small>` : ''}</div></li>`
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

/* Antes: achava o imóvel em window.TAMADA_CATALOG (2,2 MB, 4.429 imóveis)
   e SÓ DEPOIS buscava imovel/{ref}.json — ou seja, o caminho rápido ficava
   preso atrás do lento, mesmo sem precisar dele: o ref já vem pronto na
   URL. Desde que imovel/{ref}.json passou a trazer título/preço/specs (não
   só fotos/descrição), essa página não depende mais do catálogo grande pra
   nada essencial — só pra sugerir "imóveis parecidos" (ver pickSimilar). */
const ref = (new URLSearchParams(location.search).get('ref') || '').toUpperCase().trim();
carregarImovel(ref).then(property => {
  if (property && property.title) {
    render(property);
  } else {
    document.title = 'Imóvel não encontrado — Tamada Imóveis';
    document.querySelector('#detailNotFound').hidden = false;
  }
});
