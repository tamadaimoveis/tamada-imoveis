/* sobre.js — lightbox da galeria "Nosso espaço" (array fixo, sem lógica de catálogo)
   + reveal de foto ligado ao scroll nas duas transições hero->conteúdo (#heroTransition
   e #valuesTransition) — só a foto abre conforme rola, o resto da página usa .reveal normal.
   Menu/scroll/reveal/magnetic/ano vêm de common.js. */

(() => {
  const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof gsap === 'undefined';
  if (!semAnimacao) gsap.registerPlugin(ScrollTrigger);

  /* Nada de pin: quando a seção é mais alta que a tela do usuário, travar
     ela corta o que não cabe (a foto some no escuro, sem jeito de rolar até
     o resto) e a troca de "rolando normal" pra "travado" no meio do caminho
     dá o solavanco. Sem pin a página nunca fica presa — o que não coube na
     tela ainda dá pra ver rolando mais um pouco, como qualquer página normal.
     start:'top bottom' começa assim que a seção aparece por baixo; end:'top
     top' termina quando ela alinha no topo — ainda inteira na tela, não some
     antes de completar. */
  function fotoAoRolar(section) {
    if (!section) return;
    const img = section.querySelector('.about-image');
    if (!img) return;

    if (semAnimacao) { img.style.clipPath = 'inset(0 0 0% 0)'; return; }

    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.6 }
    }).fromTo(img, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none' });
  }

  const heroTransition = document.querySelector('#heroTransition');
  if (heroTransition) {
    // Só nesta seção o texto ao lado fica parado (visível desde já) — pedido
    // específico daqui; na segunda seção o texto usa o .reveal normal do site.
    const copy = heroTransition.querySelector('.about-copy');
    copy.style.opacity = '1';
    copy.style.transform = 'none';
  }

  [heroTransition, document.querySelector('#valuesTransition')].forEach(fotoAoRolar);
})();

const SPACE_PHOTOS = [
  { src: 'assets/images/space-sobre-1.jpg', alt: 'Fachada do escritório Tamada Imóveis' },
  { src: 'assets/images/space-sobre-2.jpg', alt: 'Sala de reunião do escritório Tamada Imóveis' },
  { src: 'assets/images/space-sobre-3.jpg', alt: 'Recepção do escritório Tamada Imóveis' },
  { src: 'assets/images/space-sobre-4.jpg', alt: 'Detalhe do escritório Tamada Imóveis' },
  { src: 'assets/images/space-sobre-5.jpg', alt: 'Corredor do escritório Tamada Imóveis' },
  { src: 'assets/images/space-sobre-6.jpg', alt: 'Vista do bairro a partir do escritório Tamada Imóveis' },
];

const lightbox = document.querySelector('#lightbox');
const lbImg = document.querySelector('#lbImage');
const thumbs = document.querySelector('#lbThumbs');
const counter = document.querySelector('#lightboxCounter');
document.querySelector('#lightboxTitle').textContent = 'Nosso espaço';
let cur = 0, zoom = 1, rot = 0, panX = 0, panY = 0;

thumbs.innerHTML = SPACE_PHOTOS.map((p, i) =>
  `<button class="lb-thumb" type="button" data-i="${i}"><img src="${p.src}" alt="" loading="lazy"></button>`
).join('');
const thumbEls = [...thumbs.querySelectorAll('.lb-thumb')];

const applyTransform = () => { lbImg.style.transform = `translate(${panX}px,${panY}px) scale(${zoom}) rotate(${rot}deg)`; lbImg.style.cursor = zoom > 1 ? 'grab' : 'default'; };
const show = i => {
  cur = (i + SPACE_PHOTOS.length) % SPACE_PHOTOS.length;
  zoom = 1; rot = 0; panX = 0; panY = 0;
  lbImg.src = SPACE_PHOTOS[cur].src;
  lbImg.alt = SPACE_PHOTOS[cur].alt;
  counter.textContent = `${cur + 1} / ${SPACE_PHOTOS.length}`;
  thumbEls.forEach((t, i) => t.classList.toggle('on', i === cur));
  applyTransform();
};
const openLb = i => { show(i); lightbox.hidden = false; document.body.classList.add('modal-open'); };
const closeLb = () => { lightbox.hidden = true; document.body.classList.remove('modal-open'); };

document.querySelectorAll('.space-gallery-item').forEach(cell => cell.addEventListener('click', () => openLb(Number(cell.dataset.i))));
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

/* Alguns navegadores embutidos (WhatsApp, Instagram) bloqueiam autoplay mesmo
   com muted+playsinline — o vídeo fica parado no pôster sem nenhum aviso.
   Se play() falhar, mostra um botão pra iniciar manualmente. */
(() => {
  const video = document.querySelector('#heroVideo');
  const playButton = document.querySelector('#heroVideoPlay');
  if (!video || !playButton) return;

  video.play()?.catch(() => { playButton.hidden = false; });

  playButton.addEventListener('click', () => {
    video.play().then(() => { playButton.hidden = true; }).catch(() => {});
  });
})();
