/* trabalhe-conosco.js — stats reais da carteira + formulario de candidatura.
   Menu/scroll/reveal/magnetic/ano vem de common.js. */

/* Os números da carteira eram fixos no HTML (93 imóveis, 55 bairros) —
   congelados no dia em que a página foi escrita, sem ligação nenhuma com o
   catálogo real. Calculados aqui a partir do mesmo window.TAMADA_CATALOG/
   TAMADA_BAIRROS que abastece imoveis.html — o catálogo é regerado do Sanity
   a cada deploy (npm run build), então esses números acompanham o estoque de
   verdade sozinhos, sem precisar editar a página.
   Tinha um terceiro stat de "ticket médio de venda", média de todas as
   vendas do catálogo — real, mas puxada pra cima por imóveis de alto padrão
   e destoando do ticket típico. Virou texto fixo sobre cultura da empresa em
   vez de número que confundia mais do que ajudava. */
function renderStats() {
  const inventory = Array.isArray(window.TAMADA_CATALOG) ? window.TAMADA_CATALOG : [];
  const bairros = Array.isArray(window.TAMADA_BAIRROS) ? window.TAMADA_BAIRROS : [];
  if (!inventory.length) return;

  const carteira = String(inventory.length);
  const totalBairros = String(bairros.length);

  ['statCarteira', 'statCarteira3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = carteira;
  });
  ['statBairros', 'statBairros3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = totalBairros;
  });
}
renderStats();

/* ===== Formulário de candidatura =====
   Antes só gravava em localStorage e mostrava sucesso — ninguém na Tamada
   recebia a candidatura. Mesma correção do anuncie.js: Web3Forms manda por
   e-mail de verdade, sem precisar de backend próprio. Aqui o corpo vai como
   FormData (não JSON) porque é o único jeito de anexar o arquivo do currículo
   junto — Web3Forms recebe e entrega como anexo do e-mail, sem precisar de
   um lugar próprio pra guardar o arquivo (chegou a se cogitar o Sanity, mas
   isso pediria token de escrita, upload próprio e ainda não resolveria "onde
   o recrutador olha o currículo" melhor do que ele já chegar no e-mail). */
const WEB3FORMS_KEY = '92051aa8-1242-4ed0-98d4-8830e7f9c71b';

const form = document.querySelector('#recruitForm');
const success = document.querySelector('#recruitSuccess');
const submitButton = document.querySelector('#rcSubmit');
const errorNote = document.querySelector('#rcError');
const val = id => (document.querySelector(id).value || '').trim();

/* Nem toda vaga é corretor — os campos de CRECI só fazem sentido pra quem
   está se candidatando a corretor autônomo. Some/aparece e liga/desliga o
   required de #rcStatus conforme a vaga escolhida; o texto de "experiência"
   também muda pra pedir o que faz sentido em cada caso (mercado imobiliário
   vs. formação/experiência administrativa). */
const roleField = document.querySelector('#rcRole');
const corretorFields = document.querySelector('#rcCorretorFields');
const statusField = document.querySelector('#rcStatus');
const formacaoFields = document.querySelector('#rcFormacaoFields');
const formacaoInputs = ['#rcFormado', '#rcAnoConclusao', '#rcFaculdade', '#rcCurso'].map(sel => document.querySelector(sel));
const experienceLabel = document.querySelector('#rcExperienceLabel');
const experienceField = document.querySelector('#rcExperience');

function atualizarCamposPorVaga() {
  const valor = roleField.value;
  const ehCorretor = valor === 'Corretor autônomo';
  const mostrarFormacao = valor !== '' && !ehCorretor;

  corretorFields.hidden = !ehCorretor;
  statusField.required = ehCorretor;
  if (!ehCorretor) statusField.value = '';

  formacaoFields.hidden = !mostrarFormacao;
  if (!mostrarFormacao) formacaoInputs.forEach(input => { input.value = ''; });

  if (ehCorretor) {
    experienceLabel.textContent = 'Conte um pouco da sua experiência';
    experienceField.placeholder = 'Tempo de mercado, imóveis que já negociou, o que você busca...';
  } else {
    experienceLabel.textContent = 'Conte sua experiência profissional';
    experienceField.placeholder = 'Experiências anteriores, o que te trouxe até aqui...';
  }

  // #rcStatus/#rcFormado usam o dropdown customizado (elegant-select) — setar
  // .value por JS não dispara o 'change' que ele escuta pra atualizar o texto
  // mostrado, então sem isto o rótulo customizado ficava com a opção antiga
  // mesmo depois de limpo.
  if (window.refreshElegantSelects) window.refreshElegantSelects();
}
roleField.addEventListener('change', atualizarCamposPorVaga);
atualizarCamposPorVaga();

form.addEventListener('submit', async e => {
  e.preventDefault();
  errorNote.hidden = true;

  const role = val('#rcRole');
  const name = val('#rcName');
  const phone = val('#rcPhone');
  const email = val('#rcEmail');
  const status = val('#rcStatus');
  const consent = document.querySelector('#rcConsent').checked;

  if (!role || !name || phone.replace(/\D/g, '').length < 8 || !email.includes('@') || (statusField.required && !status) || !consent) {
    form.reportValidity();
    return;
  }

  const creci = val('#rcCreci');
  const formado = val('#rcFormado');
  const anoConclusao = val('#rcAnoConclusao');
  const faculdade = val('#rcFaculdade');
  const curso = val('#rcCurso');
  const experience = val('#rcExperience');
  const resumeFile = document.querySelector('#rcResume').files[0];

  try {
    localStorage.setItem('tamada_recruit', JSON.stringify({ role, name, phone, email, status, creci, formado, anoConclusao, faculdade, curso, experience, at: new Date().toISOString() }));
  } catch (_) {}

  submitButton.disabled = true;
  submitButton.querySelector('span').textContent = 'Enviando…';

  try {
    const data = new FormData();
    data.append('access_key', WEB3FORMS_KEY);
    data.append('subject', `Candidatura — ${role} — ${name}`);
    data.append('from_name', 'Site Tamada — Trabalhe conosco');
    data.append('Vaga de interesse', role);
    data.append('Nome', name);
    data.append('Telefone', phone);
    data.append('E-mail', email);
    if (status) data.append('Já é corretor?', status);
    if (status) data.append('CRECI', creci || '—');
    if (formado) {
      data.append('É formado(a)?', formado);
      data.append('Faculdade / instituição', faculdade || '—');
      data.append('Curso', curso || '—');
      data.append('Ano de conclusão', anoConclusao || '—');
    }
    data.append('Experiência', experience || '—');
    if (resumeFile) data.append('Currículo', resumeFile);

    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    // Com anexo, o Web3Forms responde com uma página HTML de sucesso, não
    // JSON (testado — só o envio sem arquivo, em JSON puro, volta JSON de
    // verdade). response.ok já confirma o envio; só lê o corpo como JSON
    // quando o Content-Type promete JSON, pra não estourar em .json() numa
    // resposta HTML.
    let ok = response.ok;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const result = await response.json();
      ok = ok && result.success !== false;
    }
    if (!ok) throw new Error('Falha no envio');

    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    errorNote.textContent = 'Não deu para enviar agora. Tenta de novo em instantes ou liga direto pelo (11) 2682-2320.';
    errorNote.hidden = false;
    submitButton.disabled = false;
    submitButton.querySelector('span').textContent = 'Enviar candidatura';
  }
});
