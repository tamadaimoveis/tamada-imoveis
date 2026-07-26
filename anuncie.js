const WHATS = '5511966378282'; // locação e proprietários

const form = document.querySelector('#propertyForm');
const val = id => (document.querySelector(id).value || '').trim();

form.addEventListener('submit', e => {
  e.preventDefault();

  const type = val('#afType');
  const goal = val('#afGoal');
  const name = val('#afName');
  const phone = val('#afPhone');
  const email = val('#afEmail');
  const consent = document.querySelector('#afConsent').checked;

  // Obrigatórios: tipo, objetivo, nome, telefone, email, consentimento
  if (!type || !goal || !name || phone.replace(/\D/g, '').length < 8 || !email.includes('@') || !consent) {
    form.reportValidity();
    return;
  }

  // Monta resumo do imóvel
  const lines = [`*Anúncio de imóvel — Tamada*`, ``, `Tipo: ${type}`, `Objetivo: ${goal}`];
  const beds = val('#afBeds'); if (beds) lines.push(`Dormitórios: ${beds}`);
  const baths = val('#afBaths'); if (baths) lines.push(`Banheiros: ${baths}`);
  const garage = val('#afGarage'); if (garage) lines.push(`Vagas: ${garage}`);
  const area = val('#afArea'); if (area) lines.push(`Área: ${area} m²`);
  const location = val('#afLocation'); if (location) lines.push(`Bairro/Cidade: ${location}`);
  const address = val('#afAddress'); if (address) lines.push(`Endereço: ${address}`);
  const notes = val('#afNotes'); if (notes) lines.push(`Obs.: ${notes}`);
  lines.push(``, `*Contato*`, `Nome: ${name}`, `Telefone: ${phone}`, `E-mail: ${email}`);

  // Hook p/ CRM futuro
  try {
    localStorage.setItem('tamada_announce', JSON.stringify({ type, goal, beds, baths, garage, area, location, address, notes, name, phone, email, at: new Date().toISOString() }));
  } catch (_) {}

  const url = `https://wa.me/${WHATS}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener');
});

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
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal (design system)
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
}, { threshold: .12, rootMargin: '0px 0px -40px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Magnetic
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .08}px, ${(e.clientY - r.top - r.height / 2) * .1}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

document.querySelector('#currentYear').textContent = new Date().getFullYear();
