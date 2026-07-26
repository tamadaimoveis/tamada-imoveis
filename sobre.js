/* sobre.js — lightbox da galeria "Nosso espaço" (array fixo, sem lógica de catálogo)
   + reveal ligado ao scroll na transição hero -> "Quem somos" (some a foto/texto no topo,
   preenche conforme rola, acomoda quando termina — só nessa seção, o resto usa .reveal normal).
   Menu/scroll/reveal/magnetic/ano vêm de common.js. */

(() => {
  const section = document.querySelector('#heroTransition');
  if (!section) return;
  const img = section.querySelector('.about-image');
  const copy = section.querySelector('.about-copy');

  const REVEAL_DISTANCE = 550; // px de scroll ate revelar 100% — carrega em branco (scrollY=0 => progresso 0)
  const onScroll = () => {
    let progress = window.scrollY / REVEAL_DISTANCE;
    progress = Math.min(1, Math.max(0, progress));

    img.style.clipPath = `inset(0 0 ${(1 - progress) * 100}% 0)`;
    copy.style.opacity = progress;
    copy.style.transform = `translateY(${(1 - progress) * 40}px)`;

    if (progress >= 1) window.removeEventListener('scroll', onScroll);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
