import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // O site antigo era um .html por página. Quem tem link salvo continua
  // chegando nessas URLs — redireciona pra rota nova em vez de dar 404.
  // imovel.html fica de fora: depende do ?ref=, tratado em
  // src/app/imovel.html/route.ts.
  async redirects() {
    const paginas = [
      ['/index.html', '/'],
      ['/imoveis.html', '/imoveis'],
      ['/anuncie.html', '/anuncie'],
      ['/financiamento.html', '/financiamento'],
      ['/sobre.html', '/sobre'],
      ['/trabalhe-conosco.html', '/trabalhe-conosco'],
    ]
    return paginas.map(([source, destination]) => ({ source, destination, permanent: true }))
  },
}

export default nextConfig
