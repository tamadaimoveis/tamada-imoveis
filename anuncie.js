const WEB3FORMS_KEY = '92051aa8-1242-4ed0-98d4-8830e7f9c71b';

const form = document.querySelector('#propertyForm');
const val = id => (document.querySelector(id).value || '').trim();

/* Preenche bairro/cidade e rua a partir do CEP — ViaCEP, gratuito e sem
   cadastro. Só a rua e o bairro vêm do CEP; número e complemento continuam
   por conta de quem preenche, então só entra em #afAddress se ela ainda
   estiver vazia (não sobrescreve o que a pessoa já digitou). */
const cepField = document.querySelector('#afCep');
const cepStatus = document.querySelector('#afCepStatus');
let cepLookupToken = 0;

cepField.addEventListener('input', () => {
  const digits = cepField.value.replace(/\D/g, '').slice(0, 8);
  cepField.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  if (digits.length < 8) { cepStatus.textContent = ''; cepStatus.removeAttribute('data-state'); return; }

  const token = ++cepLookupToken;
  cepStatus.textContent = 'Buscando endereço…';
  cepStatus.removeAttribute('data-state');

  fetch(`https://viacep.com.br/ws/${digits}/json/`)
    .then(response => response.json())
    .then(data => {
      if (token !== cepLookupToken) return; // resposta de um CEP já trocado
      if (data.erro) { cepStatus.textContent = 'CEP não encontrado.'; cepStatus.dataset.state = 'error'; return; }
      document.querySelector('#afLocation').value = `${data.bairro} - ${data.localidade}/${data.uf}`;
      const addressField = document.querySelector('#afAddress');
      if (!addressField.value.trim() && data.logradouro) addressField.value = data.logradouro;
      cepStatus.textContent = 'Endereço encontrado.';
      cepStatus.dataset.state = 'ok';
    })
    .catch(() => {
      if (token !== cepLookupToken) return;
      cepStatus.textContent = 'Não deu para buscar o CEP agora — preencha manualmente.';
      cepStatus.dataset.state = 'error';
    });
});

const submitButton = document.querySelector('#afSubmit');
const errorNote = document.querySelector('#afError');

function mostrarErro(msg) {
  errorNote.textContent = msg;
  errorNote.hidden = false;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  errorNote.hidden = true;

  const type = val('#afType');
  const goal = val('#afGoal');
  const name = val('#afName');
  const phone = val('#afPhone');
  const email = val('#afEmail');
  const consent = document.querySelector('#afConsent').checked;

  // Obrigatórios: tipo, finalidade, nome, telefone, email, consentimento
  if (!type || !goal || !name || phone.replace(/\D/g, '').length < 8 || !email.includes('@') || !consent) {
    form.reportValidity();
    return;
  }

  const beds = val('#afBeds');
  const baths = val('#afBaths');
  const garage = val('#afGarage');
  const area = val('#afArea');
  const cep = val('#afCep');
  const location = val('#afLocation');
  const pet = val('#afPet');
  const financing = val('#afFinancing');
  const address = val('#afAddress');
  const notes = val('#afNotes');

  // Hook p/ CRM futuro
  try {
    localStorage.setItem('tamada_announce', JSON.stringify({ type, goal, beds, baths, garage, area, location, address, notes, name, phone, email, at: new Date().toISOString() }));
  } catch (_) {}

  submitButton.disabled = true;
  submitButton.querySelector('span').textContent = 'Enviando…';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Anúncio de imóvel — ${name}`,
        from_name: 'Site Tamada — Anuncie seu imóvel',
        'Tipo do imóvel': type,
        Finalidade: goal,
        Quartos: beds || '—',
        Banheiros: baths || '—',
        Vagas: garage || '—',
        'Área (m²)': area || '—',
        CEP: cep || '—',
        'Bairro/Cidade': location || '—',
        'Aceita pet': pet || '—',
        'Aceita financiamento': financing || '—',
        'Endereço completo': address || '—',
        'Informações adicionais': notes || '—',
        Nome: name,
        Telefone: phone,
        'E-mail': email,
      }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Falha no envio');

    form.hidden = true;
    document.querySelector('#afSuccess').hidden = false;
  } catch (err) {
    mostrarErro('Não deu para enviar agora. Tenta de novo em instantes ou fala direto pelo telefone (11) 2682-2320.');
    submitButton.disabled = false;
    submitButton.querySelector('span').textContent = 'Enviar cadastro';
  }
});
