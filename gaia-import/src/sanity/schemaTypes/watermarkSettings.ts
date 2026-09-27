import { defineField, defineType } from 'sanity'

export const watermarkSettingsType = defineType({
  name: 'watermarkSettings',
  title: '🎨 Configurações da Marca d\'Água',
  type: 'document',
  fields: [
    defineField({
      name: 'position',
      title: 'Posição da marca d\'água',
      type: 'string',
      options: {
        list: [
          { title: '↘ Canto inferior direito', value: 'bottom-right' },
          { title: '↙ Canto inferior esquerdo', value: 'bottom-left' },
          { title: '↗ Canto superior direito', value: 'top-right' },
          { title: '↖ Canto superior esquerdo', value: 'top-left' },
          { title: '↓ Centro inferior', value: 'bottom-center' },
          { title: '● Centro da imagem', value: 'center' },
        ],
        layout: 'radio',
      },
      initialValue: 'bottom-right',
      description: 'Onde a logo vai aparecer nas fotos.',
    }),
    defineField({
      name: 'sizePercent',
      title: 'Tamanho da logo (% da largura da imagem)',
      type: 'number',
      initialValue: 15,
      validation: (r) => r.min(5).max(40).required(),
      description: 'Entre 5 e 40. Padrão: 15 (logo ocupa 15% da largura da foto).',
    }),
    defineField({
      name: 'opacity',
      title: 'Opacidade (% — quanto maior, mais visível)',
      type: 'number',
      initialValue: 75,
      validation: (r) => r.min(20).max(100).required(),
      description: 'Entre 20 e 100. Padrão: 75. Quanto maior, menos transparente.',
    }),
    defineField({
      name: 'padding',
      title: 'Distância lateral (% da largura)',
      type: 'number',
      initialValue: 5,
      validation: (r) => r.min(0).max(20).required(),
      description: 'Entre 0 e 20. Padrão: 5. Distância da logo em relação às laterais (esquerda/direita).',
    }),
    defineField({
      name: 'paddingBottom',
      title: 'Distância da base (% da altura)',
      type: 'number',
      initialValue: 2,
      validation: (r) => r.min(0).max(20).required(),
      description: 'Entre 0 e 20. Padrão: 2. Distância da logo em relação ao topo/base. Menor = mais próximo da borda.',
    }),
    defineField({
      name: 'showShadow',
      title: 'Adicionar sombra escura atrás da logo?',
      type: 'boolean',
      initialValue: true,
      description: 'Torna a logo visível mesmo em fotos muito claras.',
    }),
    defineField({
      name: 'forceAspectRatio',
      title: '🔒 [Legado] Recortar imagens para 4:3?',
      type: 'boolean',
      description:
        'Substituído por "Recorte de proporção" abaixo — mantido só como fallback ' +
        'de leitura para documentos antigos que nunca foram salvos de novo. Não ' +
        'editar aqui: use o campo novo.',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'aspectRatioCrop',
      title: 'Recorte de proporção',
      type: 'string',
      options: {
        list: [
          { title: 'Sem recorte (mantém a foto original)', value: 'none' },
          { title: '4:3 (horizontal — formato padrão do site)', value: '4:3' },
          { title: '3:4 (vertical — melhor para fachadas/plantas altas)', value: '3:4' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
      description:
        'Substitui o antigo "Recortar para 4:3?". A importação da Tamada nunca ' +
        'fez crop de aspecto (ver LOGO_LARGURA_PCT em import-gaia.ts) — o padrão ' +
        'aqui é "Sem recorte" pra não mudar o comportamento existente. Escolha ' +
        '4:3 ou 3:4 só se quiser padronizar o enquadramento do catálogo.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Configurações da Marca d\'Água' }),
  },
})
