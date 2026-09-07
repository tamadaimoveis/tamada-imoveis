/* common.js — menu mobile, header ao rolar, reveal-on-scroll, magnetic, ano do rodapé.
   Compartilhado pelas páginas internas (imoveis, imovel, anuncie, financiamento, sobre).
   index.html não usa este arquivo — script.js resolve o mesmo ali. */

const menuToggle = document.querySelector('#menuToggle');
const mobileMenu = document.querySelector('#mobileMenu');
if (!menuToggle || !mobileMenu) {
  // Não deveria faltar em nenhuma página que carrega este script, mas um
  // clique no menu que não faz nada (sem erro nenhum visível pro usuário)
  // é exatamente o sintoma de continuar em silêncio daqui pra baixo com
  // uma referência nula — melhor um erro claro no console do que um botão
  // morto sem pista nenhuma de por quê.
  console.error('common.js: #menuToggle ou #mobileMenu não encontrado no DOM.');
}
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
// Header vira sólido/fixo (.scrolled) depois de 90px, como qualquer navbar
// fixa comum — fica sempre visível, sem sumir ao rolar. (Chegou a esconder
// ao descer numa versão anterior, pra compensar seções sem espaço reservado
// pra ele; a causa raiz real do overlap era outra — a hero da home cortando
// conteúdo com overflow:hidden — já corrigida, então o header não precisa
// mais desse comportamento.)
const onHeaderScroll = () => siteHeader.classList.toggle('scrolled', window.scrollY > 90);
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
