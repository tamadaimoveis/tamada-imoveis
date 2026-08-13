export default function Footer() {
  const ano = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <a className="footer-brand" href="/">
          <img src="/assets/images/tamada-logo-white.png" alt="Tamada Imóveis" width={400} height={148} />
          <span>
            Venda, locação e administração
            <br />
            de imóveis em São Paulo e região.
          </span>
        </a>
        <div className="footer-columns">
          <div>
            <h3>Encontrar</h3>
            <a href="/imoveis?purpose=sale">Comprar</a>
            <a href="/imoveis?purpose=rent">Alugar</a>
            <a href="/imoveis?view=map">Buscar no mapa</a>
            <a href="/imoveis">Busca avançada</a>
          </div>
          <div>
            <h3>Serviços</h3>
            <a href="/anuncie">Anuncie seu imóvel</a>
          </div>
          <div>
            <h3>Institucional</h3>
            <a href="/sobre">A Tamada</a>
            <a href="/trabalhe-conosco">Trabalhe conosco</a>
            <a href="https://www.planalto.gov.br/ccivil_03/leis/l8245.htm" target="_blank" rel="noopener">
              Leis do Inquilinato
            </a>
            <a href="https://www.tamadaimoveis.com.br/fale-conosco" target="_blank" rel="noopener">
              Dúvidas e reclamações
            </a>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© {ano} Tamada Imóveis · CRECI 21745-J</p>
        <div className="social-links">
          <a href="https://www.instagram.com/tamadaimoveis/" target="_blank" rel="noopener" aria-label="Instagram">
            <iconify-icon icon="mdi:instagram" />
          </a>
          <a href="https://www.facebook.com/tamadaimoveis.com.br/" target="_blank" rel="noopener" aria-label="Facebook">
            <iconify-icon icon="mdi:facebook" />
          </a>
          <a href="https://www.youtube.com/@tamadaimoveis9385/featured" target="_blank" rel="noopener" aria-label="YouTube">
            <iconify-icon icon="mdi:youtube" />
          </a>
          <a
            href="https://www.linkedin.com/company/tamadaim%C3%B3veis/mycompany/?viewAsMember=true"
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn"
          >
            <iconify-icon icon="mdi:linkedin" />
          </a>
          <a href="https://www.tiktok.com/@tamadaimoveis" target="_blank" rel="noopener" aria-label="TikTok">
            <iconify-icon icon="ic:baseline-tiktok" />
          </a>
        </div>
        <a href="#">
          Voltar ao topo <iconify-icon icon="solar:arrow-up-linear" />
        </a>
      </div>
    </footer>
  )
}
