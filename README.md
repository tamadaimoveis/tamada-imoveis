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

## Catálogo: de onde vêm os imóveis

O catálogo não é escrito à mão. `catalog-data.js` e a pasta `imovel/` são
**gerados** a partir do Sanity a cada publicação — por isso os dois estão no
`.gitignore`. Editar qualquer um deles na mão é trabalho perdido: a próxima
publicação sobrescreve.

O caminho do dado é: **CRM → Sanity → build → site**. Entram no site apenas
imóveis com `publicarSite == true` e `status == "ativo"`.

Para gerar na mão:

```powershell
npm run catalogo          # gera de verdade
npm run catalogo:teste    # só mostra o que sairia, sem escrever
```

O gerador acha as credenciais no `.env.local` desta pasta ou no do Studio em
`../site/.env.local`. Não precisa de nenhuma dependência npm — só Node.

## Publicação

`npm run build` é o que a Vercel roda: gera o catálogo e depois remove da pasta
publicada os arquivos listados no `.vercelignore` (rascunhos como
`sobre.html.ORIGINAL-antes-do-video`). Essa limpeza **só age dentro da Vercel** —
rodando na sua máquina ela não apaga nada.

Cuidado ao mexer: por muito tempo o deploy foi feito por CLI direto da pasta,
sem passar pelo git. Isso deixou o repositório 11 dias atrás do que estava no
ar. Commite o que publicar.
