/* common.js — menu mobile, header ao rolar, reveal-on-scroll, magnetic, ano do rodapé.
   Compartilhado pelas páginas internas (imoveis, imovel, anuncie, financiamento, sobre).
   index.html não usa este arquivo — script.js resolve o mesmo ali. */

const menuToggle = document.querySelector('#menuToggle');
const mobileMenu = document.querySelector('#mobileMenu');
function closeMenu() {
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}
function toggleMenu() {
  const open = !mobileMenu.classList.contains('open');
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
}
menuToggle.addEventListener('click', toggleMenu);
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// Ficha do imóvel esconde o header padrão no mobile (a barra de ações da
// foto assume) — o botão de menu dela abre o mesmo #mobileMenu.
document.querySelector('#mobileMenuToggle')?.addEventListener('click', toggleMenu);

const siteHeader = document.querySelector('#siteHeader');
// No mobile o header fica sólido/fixo (.scrolled) depois de 90px — sem
// esconder ao descer, ele fica flutuando sobre o conteúdo pra sempre e
// cobre título/texto de cada seção que passa por baixo dele. Some ao
// descer, volta ao subir (padrão de app), como qualquer barra fixa que
// não reserva espaço próprio no fluxo da página.
let lastScrollY = window.scrollY;
const onHeaderScroll = () => {
  const y = window.scrollY;
  siteHeader.classList.toggle('scrolled', y > 90);
  if (window.matchMedia('(max-width:620px)').matches) {
    const goingDown = y > lastScrollY + 4;
    const goingUp = y < lastScrollY - 4;
    if (y < 90) siteHeader.classList.remove('hide');
    else if (goingDown) siteHeader.classList.add('hide');
    else if (goingUp) siteHeader.classList.remove('hide');
  }
  lastScrollY = y;
};
onHeaderScroll();
window.addEventListener('scroll', onHeaderScroll, { passive: true });

function initReveal(root = document) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });
  root.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  return observer;
}
initReveal();

function initMagnetic(root = document) {
  if (!window.matchMedia('(pointer:fine)').matches) return;
  root.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .08}px, ${(e.clientY - r.top - r.height / 2) * .1}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
initMagnetic();

// #currentYear não existe mais no app Next — cada Footer já renderiza o ano
// no servidor, sem depender de JS.
document.querySelector('#currentYear')?.replaceChildren(String(new Date().getFullYear()));
