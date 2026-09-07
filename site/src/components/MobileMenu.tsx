export default function MobileMenu() {
  return (
    <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
      <div className="mobile-menu-number">23.5145° S · 46.5067° W</div>
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
          <span>04</span> A Tamada
        </a>
      </nav>

      <div className="mobile-menu-chips" aria-label="Atalhos por tipo de imóvel">
        <a href="/imoveis?purpose=sale&type=APARTMENT">Apartamentos</a>
        <a href="/imoveis?purpose=sale&type=HOUSE">Casas</a>
        <a href="/imoveis?purpose=sale&type=TWO_STORY_HOUSE">Sobrados</a>
        <a href="/imoveis?purpose=sale&commercial=1">Comerciais</a>
      </div>

      <div className="mobile-menu-links">
        <a href="https://tmdconsultoriai.superlogica.net/clients/areadocliente" target="_blank" rel="noopener">
          2ª via de boleto <iconify-icon icon="solar:arrow-right-linear" />
        </a>
        <a href="https://tmdconsultoriai.superlogica.net/clients/areadofornecedor" target="_blank" rel="noopener">
          Extrato do proprietário <iconify-icon icon="solar:arrow-right-linear" />
        </a>
        <a href="/trabalhe-conosco">
          Trabalhe conosco <iconify-icon icon="solar:arrow-right-linear" />
        </a>
        <a href="https://www.tamadaimoveis.com.br/fale-conosco" target="_blank" rel="noopener">
          Dúvidas e reclamações <iconify-icon icon="solar:arrow-right-linear" />
        </a>
      </div>

      <div className="mobile-menu-footer">
        <a className="mobile-whatsapp" href="https://wa.me/5511965935749" target="_blank" rel="noopener">
          Conversar no WhatsApp <iconify-icon icon="solar:arrow-up-right-linear" />
        </a>
        <p>
          <span>(11) 2682-2320</span>
          <span>@tamadaimoveis</span>
          <span>CRECI 21745-J</span>
        </p>
      </div>
    </div>
  )
}
