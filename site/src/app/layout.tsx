import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tamada Imóveis — Seu lugar na cidade',
  description: 'Tamada Imóveis — venda, locação e administração de imóveis em São Paulo e região.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/imoveis.css" />
      </head>
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        {/* Textura + brilho do cursor: existiam em toda página do site antigo,
            soltos no topo do body, fora de qualquer section — common.js liga
            o bloco de interação só se #cursorGlow existir. */}
        <div className="page-grain" aria-hidden="true" />
        <div className="cursor-glow" id="cursorGlow" aria-hidden="true" />

        <div className="utility-bar">
          <div className="shell utility-inner">
            <p>
              <span className="live-dot" /> Atendimento local em São Paulo e região
            </p>
            <div>
              <a href="tel:01126822320">
                <iconify-icon icon="solar:phone-linear" /> (11) 2682-2320
              </a>
              <span className="utility-separator" />
              <a href="https://wa.me/5511965935749" target="_blank" rel="noopener">
                <iconify-icon icon="solar:chat-round-dots-linear" /> WhatsApp
              </a>
              <span className="creci">CRECI 21745-J</span>
            </div>
          </div>
        </div>

        {/* Mobile-menu/footer/whatsapp/modal NÃO ficam aqui: variam por página
            (site-footer vs catalog-footer, CTA do header, etc.) — cada
            página renderiza a própria versão, igual já fazia o HTML antigo
            (cada .html tinha sua cópia inteira do rodapé). Botar aqui
            duplicava esses elementos por cima do que a página já renderiza. */}
        {children}

        <Script src="https://code.iconify.design/iconify-icon/1.0.8/iconify-icon.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
