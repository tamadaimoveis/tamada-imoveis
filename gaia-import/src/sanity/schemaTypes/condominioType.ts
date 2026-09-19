import {defineField, defineType} from 'sanity'

/**
 * Condomínio/edifício — cadastro reutilizável de área comum, compartilhado por
 * várias unidades (imóveis `property`) independentes do mesmo prédio.
 *
 * Contrato com o Adalink-CRM (issue #1842, https://github.com/Tarcisio9547/adalink-crm/issues/1842):
 * - Direção de sincronização: Postgres → Sanity (CRM é fonte de verdade).
 * - `_id` é DETERMINÍSTICO (`condominio-{uuid_postgres}`), diferente do padrão
 *   de `property` (que usa UUID aleatório) — de propósito, para o CRM poder
 *   fazer createIfNotExists/createOrReplace idempotente por id em vez de
 *   precisar consultar o Sanity antes de cada publish.
 * - Um condomínio só é enviado ao Sanity quando tem pelo menos 1 unidade
 *   aprovada sendo publicada — condomínio "puro" (sem unidade) fica só no
 *   Postgres. Nunca é navegável/visitável sozinho no site: isso é garantido
 *   pelas queries GROQ do site nunca buscarem `condominio` como tipo raiz,
 *   não por nada neste schema.
 * - `amenitiesCondominio` é a lista de comodidades DO CONDOMÍNIO (área comum).
 *   A unidade (`property.amenities`) segue sendo a união unidade+condomínio,
 *   calculada do lado do CRM antes de publicar — não duplicar aqui um campo
 *   "amenities" que o Studio confunda com o de property.
 * - Fotos: mesmo mecanismo de upload de asset binário já usado para
 *   `property.images` (POST direto pra API de assets do Sanity), mas chamado
 *   só na criação/edição DESTE documento — a unidade nunca faz upload de
 *   foto de condomínio, só referencia (via este documento) os assets já
 *   enviados. Reuso real de asset, sem duplicar bytes.
 */
export const condominioType = defineType({
  name: 'condominio',
  title: 'Condomínio',
  type: 'document',
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome do Condomínio/Edifício',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'condominioId',
      title: '🔗 ID no CRM',
      description: 'Chave da sincronização — não editar. UUID do condomínio no Postgres.',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),

    // ── Endereço ───────────────────────────────────────────────────────────
    defineField({name: 'logradouro', title: 'Logradouro', type: 'string'}),
    defineField({
      name: 'numero',
      title: 'Número do prédio/condomínio',
      description: 'Número do lote/prédio — não confundir com o número da unidade individual.',
      type: 'string',
    }),
    defineField({name: 'bairro', title: 'Bairro', type: 'string'}),
    defineField({name: 'cidade', title: 'Cidade', type: 'string'}),
    defineField({name: 'estado', title: 'Estado (UF)', type: 'string'}),
    defineField({
      name: 'cep',
      title: 'CEP',
      type: 'string',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          return /^\d{5}-?\d{3}$/.test(value as string)
            ? true
            : 'CEP inválido. Esperado: 00000-000 ou 00000000'
        }),
    }),
    defineField({name: 'latitude', title: 'Latitude (GPS)', type: 'number'}),
    defineField({name: 'longitude', title: 'Longitude (GPS)', type: 'number'}),

    // ── Área comum ─────────────────────────────────────────────────────────
    defineField({
      name: 'amenitiesCondominio',
      title: 'Comodidades da Área Comum',
      description:
        'Comodidades do condomínio (área comum), mesmo vocabulário de ' +
        '`property.amenities`. O CRM combina esta lista com as comodidades ' +
        'próprias de cada unidade antes de publicar o imóvel — não é o campo ' +
        'que o site lê diretamente na ficha da unidade.',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Piscina', value: 'piscina'},
          {title: 'Piscina Infantil', value: 'piscina_infantil'},
          {title: 'Piscina Térmica', value: 'piscina_termica'},
          {title: 'Churrasqueira', value: 'churrasqueira'},
          {title: 'Academia', value: 'academia'},
          {title: 'Sauna', value: 'sauna'},
          {title: 'Hidromassagem', value: 'hidromassagem'},
          {title: 'Salão de Festas', value: 'salao_festas'},
          {title: 'Salão de Jogos', value: 'salao_jogos'},
          {title: 'Playground', value: 'playground'},
          {title: 'Quadra Poliesportiva', value: 'quadra_poliesportiva'},
          {title: 'Quadra de Tênis', value: 'quadra_tenis'},
          {title: 'Quadra de Beach Tênis', value: 'beach_tennis'},
          {title: 'Campo de Futebol', value: 'campo_futebol'},
          {title: 'Pista de Caminhada', value: 'pista_caminhada'},
          {title: 'Ciclovia / Ciclofaixa', value: 'ciclovia'},
          {title: 'Área de Lazer', value: 'area_lazer'},
          {title: 'Área Verde', value: 'area_verde'},
          {title: 'Espaço Gourmet', value: 'espaco_gourmet'},
          {title: 'Brinquedoteca', value: 'brinquedoteca'},
          {title: 'Coworking', value: 'coworking'},
          {title: 'Cinema', value: 'cinema'},
          {title: 'Bicicletário', value: 'bicicletario'},
          {title: 'Pet Place', value: 'pet_place'},
          {title: 'Solário', value: 'solarium'},
          {title: 'Car Wash', value: 'car_wash'},
          {title: 'Mini Mercado', value: 'mini_mercado'},
          {title: 'Estacionamento para Visitante', value: 'estacionamento_visitante'},
          {title: 'Elevador', value: 'elevador'},
          {title: 'Portão Eletrônico', value: 'portao_eletronico'},
          {title: 'Alarme', value: 'alarme'},
          {title: 'Câmeras (CFTV)', value: 'cftv'},
          {title: 'Portaria 24h', value: 'portaria_24h'},
          {title: 'Segurança 24h', value: 'seguranca_24h'},
          {title: 'Zelador', value: 'zelador'},
          {title: 'Energia Solar', value: 'energia_solar'},
          {title: 'Garagem Coberta', value: 'garagem_coberta'},
          {title: 'Condomínio Fechado', value: 'condominio_fechado'},
          {title: 'Acessibilidade PNE', value: 'acessibilidade_pne'},
        ],
      },
    }),

    // ── Mídia ──────────────────────────────────────────────────────────────
    defineField({
      name: 'imagens',
      title: 'Fotos da Área Comum',
      description:
        'Compartilhadas por todas as unidades vinculadas — não duplicar essas ' +
        'fotos dentro de `property.images` de cada unidade.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'legenda', title: 'Legenda', type: 'string'}),
          ],
        },
      ],
    }),

    // ── Sincronização ──────────────────────────────────────────────────────
    defineField({
      name: 'dataAtualizacaoCRM',
      title: 'Última atualização no CRM',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'nome',
      bairro: 'bairro',
      cidade: 'cidade',
      media: 'imagens.0',
    },
    prepare({title, bairro, cidade, media}) {
      return {
        title: title ?? 'Sem nome',
        subtitle: [bairro, cidade].filter(Boolean).join(', ') || 'sem localização',
        media,
      }
    },
  },
})
