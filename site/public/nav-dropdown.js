const canHover = window.matchMedia('(hover: hover)').matches;
const allNavDropdowns = document.querySelectorAll('.nav-dropdown');

function closeNavDropdown(dropdown) {
  dropdown.removeAttribute('open');
  dropdown.classList.remove('nav-dropdown-hovered');
}

allNavDropdowns.forEach(dropdown => {
  dropdown.addEventListener('click', event => {
    if (event.target.closest('a')) closeNavDropdown(dropdown);
  });

  if (!canHover) return;
  let closeTimer = null;
  dropdown.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
    allNavDropdowns.forEach(other => { if (other !== dropdown) closeNavDropdown(other); });
    dropdown.setAttribute('open', '');
    dropdown.classList.add('nav-dropdown-hovered');
  });
  dropdown.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(() => closeNavDropdown(dropdown), 220);
  });
});

document.addEventListener('click', event => {
  document.querySelectorAll('.nav-dropdown[open]').forEach(dropdown => {
    if (!dropdown.contains(event.target)) closeNavDropdown(dropdown);
  });
});
