/* Fonte única do texto/foto do hero por finalidade (Comprar/Alugar/Comercial/Catálogo).
   Carregado no <head> — bloqueante, de propósito — pra existir ANTES do HTML do hero
   ser desenhado. É o que o script inline dentro de imoveis.html lê pra corrigir o hero
   certo já na primeira pintura da página (sem isso, ela nasce sempre com o conteúdo de
   "Comprar" e troca depois, dando um flash visível em qualquer outra aba).
   imoveis.js usa este mesmo objeto — mudou aqui, mudou pra tudo. */
window.HERO_COPY = {
  all: { eyebrow: 'Catálogo Tamada', title: 'Encontre um lugar<br><em>para chamar de seu.</em>', sub: 'Todas as oportunidades reunidas em um só lugar, para facilitar a sua busca.', img: 'assets/images/hero-catalogo.jpg' },
  sale: { eyebrow: 'Imóveis à venda', title: 'O lugar certo<br><em>está esperando por você.</em>', sub: 'Casas, apartamentos, sobrados e terrenos à venda em São Paulo e região — com curadoria e atendimento local.', img: 'assets/images/hero-comprar.jpg' },
  rent: { eyebrow: 'Imóveis para alugar', title: 'Alugue sem<br><em>complicação.</em>', sub: 'Do primeiro contato à entrega das chaves, tornamos o processo de locação mais simples para você.', img: 'assets/images/hero-alugar.jpg' },
  commercial: { eyebrow: 'Imóveis comerciais', title: 'O ponto certo<br><em>para o seu negócio.</em>', sub: 'Salas, salões, galpões e prédios para locação e venda — o espaço ideal para a sua operação crescer.', img: 'assets/images/hero-comercial.jpg' }
};
