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
      title: 'Recortar imagens para 4:3 (formato do site)?',
      type: 'boolean',
      initialValue: true,
      description: 'Recomendado: SIM. Garante que a pré-visualização no Sanity é IGUAL ao que aparece no site. Sem isso, partes da imagem podem ser cortadas no site sem aviso.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Configurações da Marca d\'Água' }),
  },
})
