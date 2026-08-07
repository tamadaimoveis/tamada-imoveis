/* Substitui visualmente um <select data-elegant> por um dropdown customizado,
   mantendo o <select> original escondido e funcional (recebe .value e evento
   'change' normalmente, então todo o resto do código continua funcionando).
   A lista é reconstruída a cada abertura, então options trocadas via JS
   (ex.: faixas de preço que mudam por finalidade) sempre aparecem atualizadas. */
function enhanceSelect(select) {
  if (!select || select.dataset.enhanced) return;
  select.dataset.enhanced = '1';

  const wrap = document.createElement('div');
  wrap.className = 'elegant-select';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'elegant-select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = '<span></span><iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon>';
  const label = trigger.querySelector('span');

  const list = document.createElement('ul');
  list.className = 'elegant-select-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  function syncLabel() {
    const active = [...select.options].find(option => option.value === select.value) || select.options[0];
    label.textContent = active ? active.textContent : '';
    list.querySelectorAll('li').forEach(item => item.classList.toggle('active', item.dataset.value === select.value));
  }

  function rebuild() {
    list.innerHTML = '';
    [...select.options].forEach(option => {
      const item = document.createElement('li');
      item.setAttribute('role', 'option');
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncLabel();
        close();
        trigger.focus();
      });
      list.appendChild(item);
    });
    syncLabel();
  }

  // A lista é "teleportada" pro <body> em position:fixed ao abrir, pra nunca
  // ficar cortada por um ancestral com overflow:auto (ex.: o painel de
  // filtros, que tem scroll próprio). Volta pro wrap ao fechar.
  function position() {
    const rect = trigger.getBoundingClientRect();
    list.style.left = `${rect.left}px`;
    list.style.top = `${rect.bottom + 6}px`;
    list.style.width = `${rect.width}px`;
  }
  function close() {
    if (list.hidden) return;
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    wrap.classList.remove('is-open');
    wrap.appendChild(list);
  }
  function open() {
    document.querySelectorAll('.elegant-select.is-open').forEach(other => other !== wrap && other.querySelector('.elegant-select-trigger').click());
    rebuild();
    document.body.appendChild(list);
    position();
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    wrap.classList.add('is-open');
  }

  trigger.addEventListener('click', () => { wrap.classList.contains('is-open') ? close() : open(); });
  document.addEventListener('click', event => { if (!wrap.contains(event.target) && !list.contains(event.target)) close(); });
  trigger.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  window.addEventListener('scroll', () => { list.hidden ? null : position(); }, true);
  window.addEventListener('resize', () => { list.hidden ? null : position(); });

  select.addEventListener('change', syncLabel);

  select.insertAdjacentElement('afterend', wrap);
  wrap.appendChild(trigger);
  wrap.appendChild(list);
  select.classList.add('elegant-select-source');
  select._elegantRebuild = rebuild;
  rebuild();
}

document.querySelectorAll('select[data-elegant]').forEach(enhanceSelect);

/* Chamado depois de mudar select.value ou select.innerHTML via JS (fora de um
   clique no próprio dropdown), pra manter o visual sincronizado com o estado. */
window.refreshElegantSelects = function () {
  document.querySelectorAll('select[data-elegant]').forEach(select => {
    if (select._elegantRebuild) select._elegantRebuild();
  });
};
