import type {ComponentType} from 'react'
import {defineField, defineType, type ArrayOfObjectsInputProps, type ObjectInputProps} from 'sanity'
import {MultiImageInput, SingleImageInput} from '../components/MultiImageInput'

/**
 * Schema `property` — Tamada Imóveis.
 *
 * ⚠️ CONTRATO COM O CRM (Adalink-CRM). Os campos marcados com [CRM] estão na
 * allowlist de `supabase/functions/update-imovel-sanity` (SANITY_ALLOWED) e/ou
 * em `publish-captacao-to-sanity/lib.ts` (buildPropertyDoc). RENOMEAR QUALQUER
 * UM DELES QUEBRA a edição de imóvel e a publicação de captação no CRM.
 * Campos novos são livres — o CRM ignora o que não conhece.
 *
 * Origem dos dados: feed XML Gaia/ValueGaia (GaiaWebServiceImovel).
 */
export const propertyType = defineType({
  name: 'property',
  title: 'Imóvel',
  type: 'document',
  groups: [
    {name: 'principal', title: 'Principal', default: true},
    {name: 'valores', title: 'Valores'},
    {name: 'medidas', title: 'Medidas e Cômodos'},
    {name: 'local', title: 'Localização'},
    {name: 'midia', title: 'Fotos e Mídia'},
    {name: 'interno', title: '🔒 Interno'},
  ],
  fields: [
    // ── Identificação ──────────────────────────────────────────────────────
    defineField({
      name: 'codigoImovel',
      title: '🔢 Código do Imóvel (REF)',
      description:
        'Código usado pela equipe e nas URLs (ex: AP9128). Vem do Gaia na importação; ' +
        'imóveis cadastrados pelo CRM recebem um número sequencial.',
      type: 'string',
      group: 'principal',
      readOnly: ({currentUser}) => {
        if (!currentUser) return true
        return !currentUser.roles?.some((r) => r.name === 'administrator')
      },
      validation: (rule) =>
        rule
          .required()
          .error('O código é obrigatório.')
          .custom(async (value, context) => {
            if (typeof value !== 'string' || !value) return true
            const client = context.getClient({apiVersion: '2024-01-01'})
            const docId = (context.document?._id || '').replace(/^drafts\./, '')
            const conflitos = await client.fetch<{_id: string}[]>(
              `*[_type == "property" && codigoImovel == $codigo && !(_id in [$id, "drafts." + $id])][0...1]{_id}`,
              {codigo: value, id: docId}
            )
            return conflitos.length > 0 ? `Código ${value} já está em uso em outro imóvel.` : true
          }),
    }),
    defineField({
      name: 'gaiaCodigo',
      title: '🔗 Código no CRM Gaia',
      description: 'Código bruto do feed (ex: AP9128-EIU). Chave da importação — não editar.',
      type: 'string',
      group: 'interno',
      readOnly: true,
    }),
    defineField({
      name: 'status', // [CRM] valores fixos — ver SANITY_STATUS_MAP no CRM
      title: 'Status do Imóvel',
      type: 'string',
      group: 'principal',
      options: {
        list: [
          {title: '🟢 Ativo — Disponível', value: 'ativo'},
          {title: '🔴 Vendido', value: 'vendido'},
          {title: '⏸️ Inativo — Fora de circulação', value: 'inativo'},
          {title: '📝 Reservado — Em negociação', value: 'reservado'},
        ],
        layout: 'radio',
      },
      initialValue: 'ativo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publicarSite', // [CRM]
      title: 'Publicar no site?',
      description: 'Desmarque para tirar do site sem mudar o status comercial.',
      type: 'boolean',
      group: 'principal',
      initialValue: true,
    }),
    defineField({
      name: 'title', // [CRM]
      title: 'Título',
      type: 'string',
      group: 'principal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL do Imóvel',
      type: 'slug',
      group: 'principal',
      options: {
        source: (doc: Record<string, unknown>) => {
          const base = String(doc.title || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80)
          const code = doc.codigoImovel
          return code ? `${base}-${String(code).toLowerCase()}` : base
        },
        maxLength: 110,
      },
      validation: (rule) =>
        rule.required().custom((value, context) => {
          // O código precisa estar no fim da URL: é o único campo de texto onde
          // ele aparece de forma estável, e é por ele que a busca do Studio acha.
          const slug = (value as {current?: string} | undefined)?.current || ''
          const code = (context.document as {codigoImovel?: string} | undefined)?.codigoImovel
          if (code && !slug.endsWith(`-${String(code).toLowerCase()}`)) {
            return `A URL precisa terminar com "-${String(code).toLowerCase()}". Clique em "Generate" ao lado para corrigir.`
          }
          return true
        }),
    }),

    // ── Classificação ──────────────────────────────────────────────────────
    defineField({
      name: 'type', // [CRM]
      title: 'Tipo de Imóvel',
      type: 'string',
      group: 'principal',
      options: {
        list: [
          {title: 'Apartamento', value: 'apartamento'},
          {title: 'Apartamento Duplex', value: 'apartamento_duplex'},
          {title: 'Casa', value: 'casa'},
          {title: 'Sobrado', value: 'sobrado'},
          {title: 'Cobertura', value: 'cobertura'},
          {title: 'Studio / Kitnet', value: 'studio'},
          {title: 'Conjunto', value: 'conjunto'},
          {title: 'Terreno', value: 'terreno'},
          {title: 'Chácara', value: 'chacara'},
          {title: 'Sítio', value: 'sitio'},
          {title: 'Sala Comercial', value: 'sala'},
          {title: 'Salão Comercial', value: 'salao'},
          {title: 'Loja', value: 'loja'},
          {title: 'Ponto Comercial', value: 'ponto'},
          {title: 'Prédio', value: 'predio'},
          {title: 'Galpão', value: 'galpao'},
          {title: 'Área', value: 'area'},
          {title: 'Hotel', value: 'hotel'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'finalidade',
      title: 'Finalidade',
      type: 'string',
      group: 'principal',
      options: {
        list: [
          {title: 'Residencial', value: 'residencial'},
          {title: 'Comercial', value: 'comercial'},
          {title: 'Rural', value: 'rural'},
          {title: 'Industrial', value: 'industrial'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'oferta',
      title: 'Tipo de Oferta',
      description: 'Se o imóvel está à venda, para locação, ou os dois.',
      type: 'string',
      group: 'principal',
      options: {
        list: [
          {title: '💰 Venda', value: 'venda'},
          {title: '🔑 Locação', value: 'locacao'},
          {title: '💰🔑 Venda e Locação', value: 'venda_locacao'},
        ],
        layout: 'radio',
      },
      initialValue: 'venda',
    }),
    defineField({
      name: 'subTipo',
      title: 'Subtipo (Gaia)',
      description: 'Classificação detalhada vinda do Gaia. Ex: Apartamento de Condomínio.',
      type: 'string',
      group: 'interno',
    }),
    defineField({
      name: 'constructionStatus', // [CRM]
      title: 'Status da Obra',
      type: 'string',
      group: 'principal',
      options: {
        list: [
          {title: '🏠 Pronto para morar', value: 'pronto'},
          {title: '🚧 Em construção', value: 'construcao'},
          {title: '🆕 Lançamento', value: 'lancamento'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'deliveryDate',
      title: 'Data de Entrega',
      type: 'date',
      group: 'principal',
      options: {dateFormat: 'MM/YYYY'},
    }),

    // ── Valores ────────────────────────────────────────────────────────────
    defineField({
      name: 'price', // [CRM] preço principal exibido no site
      title: 'Preço de Venda (R$)',
      type: 'number',
      group: 'valores',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'priceCash', // [CRM]
      title: 'Preço à Vista (R$)',
      description: 'Valor com desconto para pagamento integral. Opcional.',
      type: 'number',
      group: 'valores',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'rentPrice', // [CRM]
      title: 'Valor de Locação (R$/mês)',
      type: 'number',
      group: 'valores',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'condominio', // [CRM]
      title: 'Valor do Condomínio (R$/mês)',
      type: 'number',
      group: 'valores',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'iptu', // [CRM]
      title: 'Valor do IPTU (R$)',
      type: 'number',
      group: 'valores',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'precoM2Venda',
      title: 'Preço médio por m² — venda (R$)',
      description: 'Calculado pelo Gaia. Usado nas comparações de mercado.',
      type: 'number',
      group: 'valores',
      readOnly: true,
    }),
    defineField({
      name: 'precoM2Locacao',
      title: 'Preço médio por m² — locação (R$)',
      type: 'number',
      group: 'valores',
      readOnly: true,
    }),
    defineField({
      name: 'paymentMethods', // [CRM]
      title: 'Formas de Pagamento Aceitas',
      type: 'array',
      group: 'valores',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'À vista', value: 'a_vista'},
          {title: 'Financiamento bancário', value: 'financiamento_bancario'},
          {title: 'Financiamento direto', value: 'financiamento_direto'},
          {title: 'Permuta', value: 'permuta'},
          {title: 'Veículos', value: 'veiculos'},
        ],
      },
    }),
    defineField({
      name: 'aceitaNegociacao',
      title: 'Aceita negociação?',
      type: 'boolean',
      group: 'valores',
    }),
    defineField({
      name: 'garantiaLocacao',
      title: 'Garantias aceitas (locação)',
      type: 'array',
      group: 'valores',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Caução', value: 'caucao'},
          {title: 'Seguro Fiança', value: 'seguro_fianca'},
          {title: 'Fiador', value: 'fiador'},
          {title: 'Capitalização', value: 'capitalizacao'},
          {title: 'Aluguel antecipado', value: 'aluguel_antecipado'},
          {title: 'Kenlo Garante', value: 'kenlo_garante'},
        ],
      },
      hidden: ({document}) => !['locacao', 'venda_locacao'].includes(String(document?.oferta ?? '')),
    }),

    // ── Medidas e cômodos ──────────────────────────────────────────────────
    defineField({name: 'area', title: 'Área Útil (m²)', type: 'number', group: 'medidas'}), // [CRM]
    defineField({name: 'areaTotal', title: 'Área Total (m²)', type: 'number', group: 'medidas'}), // [CRM]
    defineField({name: 'bedrooms', title: 'Quartos', type: 'number', group: 'medidas'}), // [CRM]
    defineField({name: 'suites', title: 'Suítes', type: 'number', group: 'medidas'}), // [CRM]
    defineField({name: 'bathrooms', title: 'Banheiros', type: 'number', group: 'medidas'}), // [CRM]
    defineField({name: 'qtdSalas', title: 'Salas', type: 'number', group: 'medidas'}),
    defineField({name: 'garage', title: 'Vagas de Garagem', type: 'number', group: 'medidas'}), // [CRM]
    defineField({name: 'vagasCobertas', title: 'Vagas Cobertas', type: 'number', group: 'medidas'}),
    defineField({name: 'vagasDescobertas', title: 'Vagas Descobertas', type: 'number', group: 'medidas'}),
    defineField({
      name: 'garageType', // [CRM]
      title: 'Tipo de Vaga',
      type: 'string',
      group: 'medidas',
      options: {
        list: [
          {title: 'Privativa', value: 'privativa'},
          {title: 'Rotativa', value: 'rotativa'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'alturaPeDireito',
      title: 'Altura do pé-direito (m)',
      description: 'Relevante em galpão e imóvel comercial.',
      type: 'number',
      group: 'medidas',
    }),
    defineField({name: 'numeroAndar', title: 'Andar da unidade', type: 'number', group: 'medidas'}),
    defineField({name: 'qtdAndar', title: 'Andares do prédio', type: 'number', group: 'medidas'}),
    defineField({name: 'qtdElevador', title: 'Elevadores', type: 'number', group: 'medidas'}),
    defineField({name: 'anoConstrucao', title: 'Ano de Construção', type: 'number', group: 'medidas'}),
    defineField({name: 'anoReforma', title: 'Ano da Reforma', type: 'number', group: 'medidas'}),

    // ── Localização ────────────────────────────────────────────────────────
    defineField({name: 'neighborhood', title: 'Bairro', type: 'string', group: 'local'}), // [CRM]
    defineField({
      name: 'cidade',
      title: 'Cidade',
      type: 'string',
      group: 'local',
      initialValue: 'São Paulo',
    }),
    defineField({name: 'estado', title: 'Estado (UF)', type: 'string', group: 'local', initialValue: 'SP'}),
    defineField({
      name: 'zona',
      title: 'Zona (São Paulo)',
      description: 'Derivada do bairro na importação. Usada nas páginas de zona do site.',
      type: 'string',
      group: 'local',
      options: {
        list: [
          {title: 'Zona Leste', value: 'leste'},
          {title: 'Zona Norte', value: 'norte'},
          {title: 'Zona Oeste', value: 'oeste'},
          {title: 'Zona Sul', value: 'sul'},
          {title: 'Centro', value: 'centro'},
          {title: 'Outra cidade / Região metropolitana', value: 'outra'},
        ],
      },
    }),
    defineField({
      name: 'address', // [CRM]
      title: 'Endereço Público (visível no site)',
      description: 'Rua + número. NÃO incluir número do apartamento.',
      type: 'string',
      group: 'local',
    }),
    defineField({name: 'addressNumber', title: 'Número', type: 'string', group: 'local'}), // [CRM]
    defineField({
      name: 'addressPrivate', // [CRM]
      title: '🔒 Complemento Privado (NÃO aparece no site)',
      type: 'string',
      group: 'interno',
    }),
    defineField({
      name: 'cep', // [CRM] — o CRM envia só dígitos (8 chars)
      title: 'CEP',
      type: 'string',
      group: 'local',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          return /^\d{5}-?\d{3}$/.test(value as string)
            ? true
            : 'CEP inválido. Esperado: 00000-000 ou 00000000'
        }),
    }),
    defineField({name: 'pontoReferencia', title: 'Ponto de Referência', type: 'string', group: 'local'}),
    defineField({
      name: 'latitude',
      title: 'Latitude (GPS)',
      description: 'Vem do Gaia quando disponível (~48% dos imóveis). Sem ela o mapa não aparece.',
      type: 'number',
      group: 'local',
    }),
    defineField({name: 'longitude', title: 'Longitude (GPS)', type: 'number', group: 'local'}),
    defineField({
      name: 'condominioNome', // [CRM]
      title: '🔒 Nome do Condomínio / Edifício (NÃO aparece no site)',
      type: 'string',
      group: 'interno',
    }),
    defineField({
      name: 'zoneamento',
      title: 'Zoneamento',
      description: 'Ex: ZM, ZEU, ZC. Relevante em terreno e imóvel comercial.',
      type: 'string',
      group: 'local',
    }),

    // ── Mídia ──────────────────────────────────────────────────────────────
    // Foto é a primeira coisa que se quer ver num imóvel — por isso aparece
    // também na aba Principal, não só na de mídia.
    defineField({
      name: 'mainImage', // [CRM] lê o asset para montar thumbnail_url
      title: 'Foto Principal',
      type: 'image',
      group: ['principal', 'midia'],
      options: {hotspot: true},
      components: {input: SingleImageInput as ComponentType<ObjectInputProps>},
    }),
    defineField({
      name: 'images',
      title: 'Galeria de Fotos',
      type: 'array',
      group: ['principal', 'midia'],
      of: [{type: 'image', options: {hotspot: true}}],
      components: {input: MultiImageInput as ComponentType<ArrayOfObjectsInputProps>},
    }),
    defineField({
      name: 'videoUrl',
      title: '🎬 Vídeo (YouTube)',
      type: 'url',
      group: 'midia',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          return /youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed|youtube\.com\/shorts/.test(
            value as string
          )
            ? true
            : 'Deve ser uma URL do YouTube (youtube.com ou youtu.be)'
        }),
    }),
    defineField({
      name: 'tourVirtual',
      title: '🔄 Tour Virtual (URL)',
      type: 'url',
      group: 'midia',
    }),
    defineField({
      name: 'plantaPDF',
      title: '🔒 Planta do Imóvel (PDF — uso interno)',
      type: 'file',
      group: 'interno',
      options: {accept: 'application/pdf'},
    }),

    // ── Conteúdo ───────────────────────────────────────────────────────────
    defineField({
      name: 'description', // [CRM]
      title: 'Descrição Detalhada',
      type: 'text',
      group: 'principal',
      rows: 10,
    }),
    defineField({
      name: 'featured', // [CRM]
      title: 'Destaque na Página Inicial?',
      type: 'boolean',
      group: 'principal',
      initialValue: false,
    }),
    defineField({
      name: 'tags', // [CRM]
      title: 'Tags / Badges',
      type: 'array',
      group: 'principal',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: '🔥 Lançamento', value: 'Lançamento'},
          {title: '💎 Alto Padrão', value: 'Alto Padrão'},
          {title: '🌟 Oportunidade', value: 'Oportunidade'},
          {title: '🤝 Exclusivo', value: 'Exclusivo'},
        ],
      },
    }),
    defineField({
      name: 'amenities', // [CRM]
      title: 'Comodidades',
      type: 'array',
      group: 'principal',
      of: [{type: 'string'}],
      options: {
        list: [
          // Lazer / condomínio
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
          {title: 'Campo de Futebol', value: 'campo_futebol'},
          {title: 'Área de Lazer', value: 'area_lazer'},
          {title: 'Área Verde', value: 'area_verde'},
          {title: 'Espaço Gourmet', value: 'espaco_gourmet'},
          {title: 'Brinquedoteca', value: 'brinquedoteca'},
          {title: 'Coworking', value: 'coworking'},
          {title: 'Cinema', value: 'cinema'},
          {title: 'Bicicletário', value: 'bicicletario'},
          {title: 'Pet Place', value: 'pet_place'},
          {title: 'Solário', value: 'solarium'},
          // Estrutura do imóvel
          {title: 'Sacada / Varanda', value: 'sacada'},
          {title: 'Varanda Gourmet', value: 'varanda_gourmet'},
          {title: 'Terraço', value: 'terraco'},
          {title: 'Quintal', value: 'quintal'},
          {title: 'Lavabo', value: 'lavabo'},
          {title: 'Área de Serviço', value: 'area_servico'},
          {title: 'Copa', value: 'copa'},
          {title: 'Despensa', value: 'despensa'},
          {title: 'Escritório', value: 'escritorio'},
          {title: 'Closet', value: 'closet'},
          {title: 'Depósito', value: 'deposito'},
          {title: 'Mezanino', value: 'mezanino'},
          {title: 'Jardim de Inverno', value: 'jardim_inverno'},
          {title: 'Lareira', value: 'lareira'},
          {title: 'Adega', value: 'adega'},
          {title: 'Pé-direito Duplo', value: 'pe_direito_duplo'},
          {title: 'Dormitório Reversível', value: 'dormitorio_reversivel'},
          {title: 'Dormitório de Empregada', value: 'dormitorio_empregada'},
          {title: 'WC de Empregada', value: 'wc_empregada'},
          {title: 'Vestiário', value: 'vestiario'},
          // Equipamentos
          {title: 'Ar Condicionado', value: 'ar_condicionado'},
          {title: 'Elevador', value: 'elevador'},
          {title: 'Interfone', value: 'interfone'},
          {title: 'Portão Eletrônico', value: 'portao_eletronico'},
          {title: 'Alarme', value: 'alarme'},
          {title: 'Câmeras (CFTV)', value: 'cftv'},
          {title: 'Portaria 24h', value: 'portaria_24h'},
          {title: 'Segurança 24h', value: 'seguranca_24h'},
          {title: 'Zelador', value: 'zelador'},
          {title: 'TV a Cabo', value: 'tv_cabo'},
          {title: 'Energia Solar', value: 'energia_solar'},
          {title: 'Garagem Coberta', value: 'garagem_coberta'},
          {title: 'Condomínio Fechado', value: 'condominio_fechado'},
          {title: 'Acessibilidade PNE', value: 'acessibilidade_pne'},
          // Mobília / estado
          {title: 'Armários Planejados', value: 'armarios_planejados'},
          {title: 'Cozinha com Área de Serviço', value: 'cozinha_servico'},
          {title: 'Mobiliado', value: 'mobiliado'},
          {title: 'Semimobiliado', value: 'semimobiliado'},
          {title: 'Aceita Pet', value: 'aceita_pet'},
          {title: 'Frente Mar', value: 'frente_mar'},
          {title: 'Beira Mar', value: 'beira_mar'},
          // Infraestrutura (relevante em terreno / rural / comercial)
          {title: 'Água', value: 'agua'},
          {title: 'Esgoto', value: 'esgoto'},
          {title: 'Energia Elétrica', value: 'energia_eletrica'},
          {title: 'Rua Asfaltada', value: 'rua_asfaltada'},
          {title: 'Entrada para Caminhões', value: 'entrada_caminhoes'},
          {title: 'Doca', value: 'doca'},
          {title: 'Vão Livre', value: 'vao_livre'},
          {title: 'Casa de Caseiro', value: 'caseiro'},
        ],
      },
    }),

    defineField({
      name: 'acabamentos',
      title: 'Acabamentos (piso)',
      description: 'Revestimento dos ambientes. Buscadores filtram muito por porcelanato.',
      type: 'array',
      group: 'principal',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Porcelanato', value: 'porcelanato'},
          {title: 'Cerâmica', value: 'ceramica'},
          {title: 'Laminado', value: 'laminado'},
          {title: 'Granito', value: 'granito'},
          {title: 'Mármore', value: 'marmore'},
          {title: 'Taco de Madeira', value: 'taco_madeira'},
          {title: 'Carpete', value: 'carpete'},
          {title: 'Ardósia', value: 'ardosia'},
          {title: 'Cimento Queimado', value: 'cimento_queimado'},
          {title: 'Contrapiso', value: 'contrapiso'},
          {title: 'Piso Elevado', value: 'piso_elevado'},
          {title: 'Piso Aquecido', value: 'piso_aquecido'},
          {title: 'Bloquete', value: 'bloquete'},
        ],
      },
    }),

    // ── Interno / captação ─────────────────────────────────────────────────
    defineField({name: 'ownerName', title: '🔒 Nome do Proprietário', type: 'string', group: 'interno'}), // [CRM]
    defineField({name: 'ownerPhone', title: '🔒 Telefone do Proprietário', type: 'string', group: 'interno'}), // [CRM]
    defineField({name: 'ownerNotes', title: '🔒 Observações Internas', type: 'text', group: 'interno'}), // [CRM]
    // [CRM] captador* são STRINGS no contrato do CRM — não converter em reference.
    // O document `broker` existe em paralelo (página "Nossa Equipe" do site).
    defineField({name: 'captador', title: 'Captador (nome)', type: 'string', group: 'interno'}),
    defineField({name: 'captadorCRECI', title: 'CRECI do Captador', type: 'string', group: 'interno'}),
    defineField({name: 'captadorCelular', title: 'Celular do Captador', type: 'string', group: 'interno'}),
    defineField({name: 'captadorEmail', title: 'E-mail do Captador', type: 'string', group: 'interno'}),
    defineField({
      name: 'ocupacao',
      title: 'Ocupação',
      type: 'string',
      group: 'interno',
      options: {
        list: [
          {title: 'Ocupado', value: 'ocupado'},
          {title: 'Desocupado', value: 'desocupado'},
          {title: 'Novo', value: 'novo'},
          {title: 'Em construção', value: 'em_construcao'},
          {title: 'Lançamento', value: 'lancamento'},
          {title: 'Não informado', value: 'nao_informado'},
        ],
      },
    }),
    defineField({
      name: 'ocupador',
      title: 'Quem ocupa',
      type: 'string',
      group: 'interno',
      options: {
        list: [
          {title: 'Proprietário', value: 'proprietario'},
          {title: 'Inquilino', value: 'inquilino'},
        ],
      },
    }),
    defineField({
      name: 'locado',
      title: 'Está locado?',
      description: 'Imóvel à venda com inquilino dentro. Afeta o agendamento da visita.',
      type: 'boolean',
      group: 'interno',
    }),
    defineField({
      name: 'exclusividade',
      title: 'Exclusividade',
      type: 'boolean',
      group: 'interno',
      initialValue: false,
    }),
    defineField({
      name: 'padraoImovel',
      title: 'Padrão do Imóvel',
      type: 'string',
      group: 'interno',
      options: {
        list: [
          {title: 'Alto', value: 'alto'},
          {title: 'Médio', value: 'medio'},
          {title: 'Regular', value: 'regular'},
          {title: 'Baixo', value: 'baixo'},
        ],
      },
    }),
    defineField({
      name: 'padraoLocalizacao',
      title: 'Padrão da Localização',
      type: 'string',
      group: 'interno',
      options: {
        list: [
          {title: 'Privilegiada', value: 'privilegiada'},
          {title: 'Ótima', value: 'otima'},
          {title: 'Boa', value: 'boa'},
          {title: 'Média', value: 'media'},
          {title: 'Regular', value: 'regular'},
        ],
      },
    }),
    defineField({
      name: 'placaNoLocal',
      title: 'Tem placa no local?',
      type: 'boolean',
      group: 'interno',
    }),
    defineField({
      name: 'urlGaiaOriginal',
      title: 'URL no site antigo',
      description:
        'Página deste imóvel no site Gaia. Guardada para montar os redirects 301 ' +
        'quando o site novo entrar no ar — sem isso, o Google perde o ranking das 4.429 páginas.',
      type: 'url',
      group: 'interno',
      readOnly: true,
    }),
    defineField({
      name: 'dataCadastroGaia',
      title: 'Cadastrado no Gaia em',
      type: 'datetime',
      group: 'interno',
      readOnly: true,
    }),
    defineField({
      name: 'dataAtualizacaoGaia',
      title: 'Última atualização no Gaia',
      description: 'Usado pela importação para pular imóveis inalterados.',
      type: 'datetime',
      group: 'interno',
      readOnly: true,
    }),

    // ── Compatibilidade com o CRM ──────────────────────────────────────────
    defineField({
      name: 'customFields',
      title: 'Campos Personalizados',
      description: 'Gerenciados no CRM. Apenas leitura aqui.',
      type: 'array',
      group: 'interno',
      readOnly: true,
      of: [
        {
          type: 'object',
          name: 'customField',
          fields: [
            {name: 'key', title: 'Chave', type: 'string'},
            {name: 'label', title: 'Rótulo', type: 'string'},
            {
              name: 'tipo',
              title: 'Tipo',
              type: 'string',
              options: {
                list: [
                  {title: 'Texto', value: 'texto'},
                  {title: 'Número', value: 'numero'},
                  {title: 'Checkbox', value: 'checkbox'},
                  {title: 'Select', value: 'select'},
                ],
              },
            },
            {name: 'value', title: 'Valor', type: 'string'},
            {name: 'sufixo', title: 'Sufixo (unidade)', type: 'string'},
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      codigo: 'codigoImovel',
      bairro: 'neighborhood',
      cidade: 'cidade',
      price: 'price',
      rent: 'rentPrice',
      status: 'status',
      media: 'mainImage',
    },
    prepare({title, codigo, bairro, cidade, price, rent, status, media}) {
      const valor =
        typeof price === 'number' && price > 0
          ? `R$ ${price.toLocaleString('pt-BR')}`
          : typeof rent === 'number' && rent > 0
            ? `R$ ${rent.toLocaleString('pt-BR')}/mês`
            : 'sem valor'
      const marca = status && status !== 'ativo' ? ` · ${status}` : ''
      return {
        title: `${codigo ? `[${codigo}] ` : ''}${title ?? 'Sem título'}`,
        subtitle: `${valor} · ${bairro ?? '?'}, ${cidade ?? '?'}${marca}`,
        media,
      }
    },
  },
})
