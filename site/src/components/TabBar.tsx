/**
 * Barra inferior fixa — só existe em mobile (≤620px via CSS, ver .tab-bar em
 * styles.css). Compartilhada por todas as páginas exceto a ficha do imóvel,
 * que usa a barra de preço + CTA no lugar (ver imovel/[ref]/page.tsx).
 */
export default function TabBar({ active }: { active?: 'inicio' | 'imoveis' | 'anuncie' | 'menu' }) {
  return (
    <nav className="tab-bar" aria-label="Navegação principal (mobile)">
      <a className={active === 'inicio' ? 'active' : undefined} href="/" aria-current={active === 'inicio' ? 'page' : undefined}>
        <iconify-icon icon="solar:home-2-linear" />
        <span>Início</span>
      </a>
      <a
        className={active === 'imoveis' ? 'active' : undefined}
        href="/imoveis"
        aria-current={active === 'imoveis' ? 'page' : undefined}
      >
        <iconify-icon icon="solar:buildings-2-linear" />
        <span>Imóveis</span>
      </a>
      <a className="tab-bar-whatsapp" href="https://wa.me/5511965935749" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <iconify-icon icon="mdi:whatsapp" />
      </a>
      <a
        className={active === 'anuncie' ? 'active' : undefined}
        href="/anuncie"
        aria-current={active === 'anuncie' ? 'page' : undefined}
      >
        <iconify-icon icon="solar:camera-linear" />
        <span>Anunciar</span>
      </a>
      <button
        className={active === 'menu' ? 'active' : undefined}
        type="button"
        data-tabbar-menu
        aria-haspopup="true"
      >
        <iconify-icon icon="solar:hamburger-menu-linear" />
        <span>Menu</span>
      </button>
    </nav>
  )
}
