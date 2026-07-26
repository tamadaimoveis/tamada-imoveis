# Tamada Atlas Urbano

Redesign independente da página da Tamada Imóveis. O clone original permanece intacto em `../clean`, `../raw` e `../audit`.

## Visualização local

Na pasta deste projeto, execute:

```powershell
python -m http.server 4177 --bind 127.0.0.1
```

Depois abra `http://127.0.0.1:4177/`.

- Homepage: `http://127.0.0.1:4177/index.html`
- Catálogo completo: `http://127.0.0.1:4177/imoveis.html`

## Conteúdo preservado

- Logo, CRECI, endereço, telefones, WhatsApps e redes sociais originais.
- Serviços e jornadas para compra, locação, proprietário, inquilino e financiamento.
- 93 imóveis únicos normalizados a partir dos oito arquivos de dados locais.
- Fotografias principais locais; nenhuma imagem imobiliária foi inventada.
- Links de detalhe apontam para as rotas originais da Tamada.
- Página independente de imóveis com grade, filtros avançados, ordenação, favoritos e visualização em mapa.

## Hero

A homepage usa `assets/images/hero-brand-atlas.png`, uma peça conceitual gerada para a campanha Atlas Urbano. Ela não representa um imóvel, endereço ou integrante real da equipe. Quando houver uma fotografia oficial do time Tamada, o arquivo pode ser substituído mantendo a mesma composição da hero.

## Mapa

O mapa usa Leaflet e tiles claros da CARTO/OpenStreetMap. Somente os 12 destaques editoriais recebem marcadores. As coordenadas são aproximadas e deslocadas de forma determinística para não expor endereços exatos.

## Próxima integração

O catálogo local é um snapshot. Para publicação, recomenda-se substituir `catalog-data.js` por uma consulta ao CRM/API atual da imobiliária mantendo a mesma estrutura de dados usada em `script.js`.
