import { defineType, defineField } from 'sanity'

export const imovelOptionsType = defineType({
  name: 'imovelOptions',
  title: 'Opções de Imóvel',
  type: 'document',
  fields: [
    defineField({
      name: 'tags',
      title: 'Tags disponíveis',
      type: 'array',
      of: [{
        type: 'object',
        name: 'tagOption',
        fields: [
          defineField({ name: 'value', type: 'string', title: 'Slug (ex: alto-padrao)' }),
          defineField({ name: 'label', type: 'string', title: 'Rótulo (ex: Alto Padrão)' }),
        ],
        preview: { select: { title: 'label', subtitle: 'value' } },
      }],
    }),
    defineField({
      name: 'amenities',
      title: 'Comodidades disponíveis',
      type: 'array',
      of: [{
        type: 'object',
        name: 'amenityOption',
        fields: [
          defineField({ name: 'value', type: 'string', title: 'Slug (ex: churrasqueira)' }),
          defineField({ name: 'label', type: 'string', title: 'Rótulo (ex: Churrasqueira)' }),
        ],
        preview: { select: { title: 'label', subtitle: 'value' } },
      }],
    }),
  ],
})
