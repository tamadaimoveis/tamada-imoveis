/* Simulador de financiamento — lógica portada do simulador da referência (React → vanilla).
   PMT (tabela Price) + faixas MCMV federais + comparação de bancos. */

const WHATS = '5511965935749';
const PRAZO_MESES = 420; // 35 anos — padrão de mercado

const BANKS_MERCADO = [
  { id: 'itau',      name: 'Itaú',            taxa: 0.1170, logo: 'assets/images/bancos/itau.png' },
  { id: 'santander', name: 'Santander',       taxa: 0.1079, logo: 'assets/images/bancos/santander.png' },
  { id: 'bradesco',  name: 'Bradesco',        taxa: 0.1199, logo: 'assets/images/bancos/bradesco.png' },
  { id: 'bb',        name: 'Banco do Brasil', taxa: 0.1145, logo: 'assets/images/bancos/bb.png' },
  { id: 'inter',     name: 'Inter',           taxa: 0.1395, logo: 'assets/images/bancos/inter.png' }
];

// Todos os logos pro carrossel
const ALL_LOGOS = [
  ['Caixa', 'assets/images/bancos/caixa.png'],
  ['Itaú', 'assets/images/bancos/itau.png'],
  ['Bradesco', 'assets/images/bancos/bradesco.png'],
  ['Santander', 'assets/images/bancos/santander.png'],
  ['Banco do Brasil', 'assets/images/bancos/bb.png'],
  ['Inter', 'assets/images/bancos/inter.png'],
  ['BRB', 'assets/images/bancos/brb.png'],
  ['Bari', 'assets/images/bancos/bari.png']
];

// Faixas MCMV (federal, taxa efetiva a.a.)
const MCMV_FAIXAS = [
  { label: 'Faixa 1',  rendaMin: 0,       rendaMax: 3200,  tetoImovel: 264000, taxaEfetiva: 0.0485 },
  { label: 'Faixa 2',  rendaMin: 3200.01, rendaMax: 4400,  tetoImovel: 264000, taxaEfetiva: 0.0564 },
  { label: 'Faixa 2',  rendaMin: 4400.01, rendaMax: 5000,  tetoImovel: 264000, taxaEfetiva: 0.0670 },
  { label: 'Faixa 3',  rendaMin: 5000.01, rendaMax: 9600,  tetoImovel: 500000, taxaEfetiva: 0.0793 },
  { label: 'Faixa 4',  rendaMin: 9600.01, rendaMax: 12000, tetoImovel: 500000, taxaEfetiva: 0.1000 }
];

function getMcmvFaixa(renda, valorImovel) {
  if (renda <= 0 || renda > 12000 || valorImovel > 500000) return null;
  const faixaRenda = MCMV_FAIXAS.find(f => renda >= f.rendaMin && renda <= f.rendaMax);
  const faixaImovel = MCMV_FAIXAS.find(f => valorImovel <= f.tetoImovel);
  if (!faixaRenda || !faixaImovel) return null;
  const idxRenda = MCMV_FAIXAS.indexOf(faixaRenda);
  const idxImovel = MCMV_FAIXAS.indexOf(faixaImovel);
  return MCMV_FAIXAS[Math.max(idxRenda, idxImovel)];
}

function calcPMT(pv, taxaAnual, n) {
  if (pv <= 0 || n <= 0) return 0;
  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  return pv * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

const fmtBRL = n => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtBRL0 = n => 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const parseBRL = raw => parseInt((raw || '').replace(/\D/g, ''), 10) || 0;
const formatInput = raw => { const n = parseInt((raw || '').replace(/\D/g, ''), 10); return n ? n.toLocaleString('pt-BR') : ''; };
function maskPhone(raw) {
  const d = (raw || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

// Estado do wizard
const S = { step: 1, valorRaw: '', entradaRaw: '', rendaRaw: '', nome: '', telefone: '', email: '' };
const root = document.querySelector('#financeSim');

function vals() {
  const valor = parseBRL(S.valorRaw), entrada = parseBRL(S.entradaRaw), renda = parseBRL(S.rendaRaw);
  const pv = Math.max(0, valor - entrada);
  const entradaPct = valor > 0 && entrada > 0 ? Math.round((entrada / valor) * 100) : 0;
  return { valor, entrada, renda, pv, entradaPct };
}

function progress(cur) {
  return `<div class="sim-progress">${[1, 2, 3].map(i => `<span class="${i <= cur ? 'on' : ''}"></span>`).join('')}</div>`;
}

function render() {
  const { valor, entrada, renda, pv, entradaPct } = vals();

  if (S.step === 1) {
    root.innerHTML = `<div class="sim-card">
      ${progress(1)}
      <h3 class="sim-q">Qual é o valor do imóvel?</h3>
      <div class="sim-money"><span>R$</span><input id="simValor" type="text" inputmode="numeric" placeholder="350.000" value="${S.valorRaw}" autofocus></div>
      <button class="button button-red button-large sim-next" id="simNext" ${valor <= 0 ? 'disabled' : ''}>Próximo <iconify-icon icon="solar:arrow-right-linear"></iconify-icon></button>
    </div>`;
    wireMoney('#simValor', 'valorRaw');
    document.querySelector('#simNext').onclick = () => { if (vals().valor > 0) { S.step = 2; render(); } };
  }

  else if (S.step === 2) {
    root.innerHTML = `<div class="sim-card">
      ${progress(2)}
      <h3 class="sim-q">Qual o valor da entrada?</h3>
      <p class="sim-hint">${valor > 0 ? `Imóvel de ${fmtBRL0(valor)} · mínimo recomendado: 20% (${fmtBRL0(valor * 0.2)})` : 'Você pode incluir o FGTS na entrada.'}</p>
      <div class="sim-money"><span>R$</span><input id="simEntrada" type="text" inputmode="numeric" placeholder="70.000" value="${S.entradaRaw}" autofocus></div>
      <p class="sim-feedback ${entradaPct >= 20 ? 'ok' : entradaPct > 0 ? 'warn' : ''}">${entrada > 0 && valor > 0 ? (entradaPct >= 20 ? `${entradaPct}% · vai financiar ${fmtBRL0(pv)}` : `${entradaPct}% — o mínimo recomendado é 20%`) : ''}</p>
      <button class="button button-red button-large sim-next" id="simNext" ${entrada <= 0 ? 'disabled' : ''}>Próximo <iconify-icon icon="solar:arrow-right-linear"></iconify-icon></button>
      <button class="sim-back" id="simBack">← Voltar</button>
    </div>`;
    wireMoney('#simEntrada', 'entradaRaw');
    document.querySelector('#simNext').onclick = () => { if (vals().entrada > 0) { S.step = 3; render(); } };
    document.querySelector('#simBack').onclick = () => { S.step = 1; render(); };
  }

  else if (S.step === 3) {
    root.innerHTML = `<div class="sim-card wide">
      ${progress(3)}
      <h3 class="sim-q">Renda e contato</h3>
      <label class="sim-field"><span>Renda familiar bruta*</span>
        <div class="sim-money"><span>R$</span><input id="simRenda" type="text" inputmode="numeric" placeholder="4.000" value="${S.rendaRaw}"></div>
        <small>Usamos para verificar o Minha Casa Minha Vida e a taxa correta.</small>
      </label>
      <div class="sim-row">
        <label class="sim-field"><span>Seu nome*</span><input id="simNome" type="text" placeholder="Nome completo" value="${S.nome}"></label>
        <label class="sim-field"><span>Telefone / WhatsApp*</span><input id="simTel" type="tel" inputmode="tel" placeholder="(11) 90000-0000" value="${S.telefone}"></label>
      </div>
      <label class="sim-field"><span>E-mail <small>(opcional)</small></span><input id="simEmail" type="email" placeholder="voce@email.com" value="${S.email}"></label>
      <button class="button button-red button-large sim-next" id="simGo">Ver resultado <iconify-icon icon="solar:arrow-right-linear"></iconify-icon></button>
      <button class="sim-back" id="simBack">← Voltar</button>
    </div>`;
    wireMoney('#simRenda', 'rendaRaw');
    document.querySelector('#simNome').oninput = e => S.nome = e.target.value;
    document.querySelector('#simTel').oninput = e => { S.telefone = maskPhone(e.target.value); e.target.value = S.telefone; };
    document.querySelector('#simEmail').oninput = e => S.email = e.target.value;
    document.querySelector('#simBack').onclick = () => { S.step = 2; render(); };
    document.querySelector('#simGo').onclick = () => {
      const v = vals();
      if (v.renda <= 0 || !S.nome.trim() || S.telefone.replace(/\D/g, '').length < 8) {
        root.querySelector('.sim-card').classList.add('shake');
        setTimeout(() => root.querySelector('.sim-card')?.classList.remove('shake'), 500);
        return;
      }
      try { localStorage.setItem('tamada_financiamento', JSON.stringify({ ...v, nome: S.nome, telefone: S.telefone, email: S.email, at: new Date().toISOString() })); } catch (_) {}
      S.step = 'result'; render();
    };
  }

  else if (S.step === 'result') {
    renderResult();
  }
}

function wireMoney(sel, key) {
  const input = document.querySelector(sel);
  if (!input) return;
  input.oninput = e => { S[key] = formatInput(e.target.value); e.target.value = S[key]; render_feedback_only(); };
  input.onkeydown = e => { if (e.key === 'Enter') document.querySelector('#simNext, #simGo')?.click(); };
}
// Atualiza só o feedback/disabled sem re-renderizar tudo (mantém foco)
function render_feedback_only() {
  const { valor, entrada, pv, entradaPct } = vals();
  const next = document.querySelector('#simNext');
  if (next) next.disabled = (S.step === 1 ? valor : entrada) <= 0;
  const fb = document.querySelector('.sim-feedback');
  if (fb && S.step === 2) {
    fb.className = 'sim-feedback ' + (entradaPct >= 20 ? 'ok' : entradaPct > 0 ? 'warn' : '');
    fb.textContent = entrada > 0 && valor > 0 ? (entradaPct >= 20 ? `${entradaPct}% · vai financiar ${fmtBRL0(pv)}` : `${entradaPct}% — o mínimo recomendado é 20%`) : '';
  }
}

function renderResult() {
  const { valor, entrada, renda, pv, entradaPct } = vals();
  const mcmv = getMcmvFaixa(renda, valor);
  const meses = PRAZO_MESES;

  const caixaTaxa = mcmv ? mcmv.taxaEfetiva : 0.1099;
  const caixaRow = { id: 'caixa', name: 'Caixa Econômica', taxa: caixaTaxa, logo: 'assets/images/bancos/caixa.png', mcmv: !!mcmv, mcmvLabel: mcmv ? mcmv.label : '' };
  const banks = [caixaRow, ...BANKS_MERCADO.map(b => ({ ...b, mcmv: false, mcmvLabel: '' }))].sort((a, b) => a.taxa - b.taxa);
  const bestPmt = Math.min(...banks.map(b => calcPMT(pv, b.taxa, meses)));

  const rows = banks.map((b, idx) => {
    const pmt = calcPMT(pv, b.taxa, meses);
    const best = idx === 0;
    const cls = best ? 'best' : b.mcmv ? 'mcmv' : '';
    const tag = best ? '<span class="sim-tag red">Menor parcela</span>' : b.mcmv ? `<span class="sim-tag green">MCMV — ${b.mcmvLabel}</span>` : '';
    return `<div class="sim-trow ${cls}">
      <div class="sim-bank"><img src="${b.logo}" alt="${b.name}"><div><b>${b.name}</b>${tag}</div></div>
      <div class="sim-taxa">${(b.taxa * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<small>% a.a.</small></div>
      <div class="sim-prazo">${meses}<small>meses</small></div>
      <div class="sim-pmt">${fmtBRL(pmt)}</div>
    </div>`;
  }).join('');

  const wa = encodeURIComponent([
    'Olá! Fiz uma simulação de financiamento no site da Tamada:',
    S.nome ? `• Nome: ${S.nome}` : '',
    `• Imóvel: ${fmtBRL0(valor)}`,
    `• Entrada: ${fmtBRL0(entrada)}${entradaPct > 0 ? ` (${entradaPct}%)` : ''}`,
    `• Financiado: ${fmtBRL0(pv)}`,
    `• Prazo: 35 anos`,
    renda > 0 ? `• Renda: ${fmtBRL0(renda)}` : '',
    mcmv ? `• Elegível ao MCMV (${mcmv.label})` : '',
    S.telefone ? `• Telefone: ${S.telefone}` : '',
    '', 'Quero conversar com um corretor sobre o financiamento!'
  ].filter(Boolean).join('\n'));

  root.innerHTML = `<div class="sim-result">
    <div class="sim-summary">
      <div class="sim-sum-main"><span>Valor financiado</span><strong>${fmtBRL0(pv)}</strong></div>
      <div class="sim-sum-side">
        <div><span>Menor parcela</span><b>${fmtBRL(bestPmt)}</b></div>
        <div><span>Entrada</span><b>${fmtBRL0(entrada)}${entradaPct ? ` · ${entradaPct}%` : ''}</b></div>
        <div><span>Prazo</span><b>35 anos</b></div>
      </div>
    </div>

    ${mcmv ? `<div class="sim-mcmv">
      <iconify-icon icon="solar:home-smile-linear"></iconify-icon>
      <div>
        <p><strong>Minha Casa Minha Vida — ${mcmv.label}:</strong> taxa efetiva de <strong>${(mcmv.taxaEfetiva * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}% a.a.</strong> — parcela na Caixa a partir de <strong>${fmtBRL(calcPMT(pv, mcmv.taxaEfetiva, meses))}/mês</strong>.</p>
        <p class="sim-mcmv-note">O subsídio do MCMV não está incluído nesta estimativa. Fale com um corretor para o valor exato.</p>
      </div>
    </div>` : ''}

    <div class="sim-table">
      <div class="sim-thead"><span>Banco</span><span>Taxa de juros</span><span>Parcelas</span><span>1ª parcela</span></div>
      ${rows}
    </div>

    <div class="sim-actions">
      <button class="button button-ghost" id="simRestart"><iconify-icon icon="solar:restart-linear"></iconify-icon> Recomeçar</button>
      <a class="button button-red button-large" href="https://wa.me/${WHATS}?text=${wa}" target="_blank" rel="noopener"><iconify-icon icon="mdi:whatsapp"></iconify-icon> Receber uma proposta</a>
    </div>
    <p class="sim-disclaimer">Esta é uma estimativa com taxas de referência de mercado. Cada banco faz análise de crédito própria — fale com um especialista para a condição real.</p>
  </div>`;

  document.querySelector('#simRestart').onclick = () => {
    Object.assign(S, { step: 1, valorRaw: '', entradaRaw: '', rendaRaw: '', nome: '', telefone: '', email: '' });
    render();
  };
}

// Carrossel de logos (duplica a lista pra loop infinito)
function buildMarquee() {
  const track = document.querySelector('#bankTrack');
  const one = ALL_LOGOS.map(([name, src]) => `<div class="bank-logo"><img src="${src}" alt="${name}" loading="lazy"></div>`).join('');
  track.innerHTML = one + one; // duas cópias = loop contínuo
}

// Menu mobile
const menuToggle = document.querySelector('#menuToggle');
const mobileMenu = document.querySelector('#mobileMenu');
menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open'); menuToggle.classList.remove('open'); document.body.classList.remove('menu-open');
}));

// Header scroll
const header = document.querySelector('#siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 90);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal + magnetic
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: .12, rootMargin: '0px 0px -40px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .08}px, ${(e.clientY - r.top - r.height / 2) * .1}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

buildMarquee();
render();
document.querySelector('#currentYear').textContent = new Date().getFullYear();
