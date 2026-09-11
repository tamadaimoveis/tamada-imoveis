/**
 * Venda, locação, ou os dois — e qual preço/rótulo mostrar em cada contexto.
 * Compartilhado por imoveis.js (catálogo) e imovel.js (ficha), carregado
 * antes dos dois (ver Efeitos scripts em imoveis/page.tsx e imovel/[ref]/page.tsx).
 *
 * Mesmo padrão adotado no ImoBueno (site/src/lib/oferta.ts, PR #1
 * "Mostra venda ou locacao conforme a carteira do visitante"): a fonte de
 * verdade são os dois preços (`sale`/`rent`), nunca o campo `oferta` do
 * Sanity — o Adalink-CRM não o preenche ao criar o imóvel via captação.
 *
 * A diferença pro ImoBueno: aqui não existe SSG/hidratação (tudo é
 * client-side, injetado via window.__TAMADA_PROPERTY__/TAMADA_CATALOG), então
 * não precisa do truque useState+useEffect — dá pra ler `purposeDaUrl()`
 * direto na primeira renderização.
 */

/** 'sale' | 'rent' | null — contexto de onde o visitante está navegando. */
function purposeDaUrl() {
  const p = new URLSearchParams(window.location.search).get('de') || new URLSearchParams(window.location.search).get('purpose');
  return p === 'rent' || p === 'sale' ? p : null;
}

/** Imóvel anunciado nas duas carteiras ao mesmo tempo. */
function temAmbos(property) {
  return Boolean(property.sale) && Boolean(property.rent);
}

/**
 * Preço em destaque, do ponto de vista do propósito.
 * Sem propósito (link direto, Google, WhatsApp), venda tem prioridade — é a
 * carteira principal da Tamada. Imóvel só de locação sempre mostra o aluguel,
 * porque é o único preço que ele tem.
 */
function precoDestaque(property, purpose) {
  if (purpose === 'rent') return property.rent || property.sale;
  if (purpose === 'sale') return property.sale || property.rent;
  return property.sale || property.rent;
}

/** `true` quando o valor em destaque é mensal (leva "/mês"). */
function destaqueEhLocacao(property, purpose) {
  const destaque = precoDestaque(property, purpose);
  if (!destaque) return false;
  return destaque === property.rent && (purpose === 'rent' || !property.sale);
}

/** O outro preço, quando o imóvel tem os dois — alimenta a linha de apoio. */
function precoSecundario(property, purpose) {
  if (!temAmbos(property)) return null;
  return destaqueEhLocacao(property, purpose) ? property.sale : property.rent;
}

/**
 * Tag "À venda" / "Para alugar" / "Venda ou locação".
 * Com propósito ativo o rótulo é o dele: quem filtrou "Alugar" vê "Para
 * alugar" mesmo num imóvel que também está à venda — é a carteira que está
 * navegando. Sem propósito, o imóvel de dupla oferta se anuncia como tal.
 */
function purposeLabelContextual(property, purpose) {
  if (purpose === 'rent' && property.rent) return 'Para alugar';
  if (purpose === 'sale' && property.sale) return 'À venda';
  if (temAmbos(property)) return 'Venda ou locação';
  return property.rent ? 'Para alugar' : 'À venda';
}

/** Rótulo acima do preço na ficha: "À venda por", "Para locação por". */
function rotuloPrecoContextual(property, purpose) {
  if (!precoDestaque(property, purpose)) return 'Valor';
  return destaqueEhLocacao(property, purpose) ? 'Para locação por' : 'À venda por';
}
