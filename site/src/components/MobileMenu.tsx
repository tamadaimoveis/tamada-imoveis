export default function MobileMenu() {
  return (
    <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
      <div className="mobile-menu-number">
        23.5145° S
        <br />
        46.5067° W
      </div>
      <nav aria-label="Navegação móvel">
        <a href="/imoveis?purpose=sale">
          <span>01</span> Comprar
        </a>
        <a href="/imoveis?purpose=rent">
          <span>02</span> Alugar
        </a>
        <a href="/anuncie">
          <span>03</span> Anuncie
        </a>
        <a href="/sobre">
          <span>04</span> Institucional
        </a>
      </nav>
      <a className="mobile-whatsapp" href="https://wa.me/5511965935749" target="_blank" rel="noopener">
        Conversar no WhatsApp <iconify-icon icon="solar:arrow-up-right-linear" />
      </a>
    </div>
  )
}
