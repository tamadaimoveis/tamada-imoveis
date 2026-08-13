import {defineField, defineType} from 'sanity'

/**
 * Corretor — alimenta a página "Nossa Equipe" do site e o seletor de captador.
 *
 * Populado pela importação a partir do bloco <corretor> do feed Gaia
 * (32 corretores distintos). O e-mail é a chave de deduplicação: o feed repete
 * o mesmo corretor em centenas de imóveis.
 *
 * Obs: o vínculo imóvel→corretor fica nos campos `captador*` (strings) do
 * `property`, porque o CRM depende desses nomes. Este documento é o cadastro
 * canônico da equipe, não a chave estrangeira.
 */
export const brokerType = defineType({
  name: 'broker',
  title: 'Corretor',
  type: 'document',
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      description: 'Chave de deduplicação da importação. Não repetir entre corretores.',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'creci',
      title: 'CRECI',
      description: 'Não vem no feed do Gaia — preencher aqui.',
      type: 'string',
    }),
    defineField({name: 'celular', title: 'Celular', type: 'string'}),
    defineField({name: 'telefone', title: 'Telefone fixo', type: 'string'}),
    defineField({
      name: 'foto',
      title: 'Foto',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'fotoUrlOrigem',
      title: 'URL da foto no Gaia',
      description: 'Origem da foto importada. Só referência — a foto usada é a de cima.',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'ativo',
      title: 'Ativo na equipe?',
      description: 'Desmarque para tirar do site sem apagar o histórico de captação.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'ordem',
      title: 'Ordem de exibição',
      description: 'Menor aparece primeiro na página da equipe.',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Ordem de exibição',
      name: 'ordemAsc',
      by: [
        {field: 'ordem', direction: 'asc'},
        {field: 'nome', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'nome', creci: 'creci', email: 'email', ativo: 'ativo', media: 'foto'},
    prepare({title, creci, email, ativo, media}) {
      return {
        title: `${title}${ativo === false ? ' (inativo)' : ''}`,
        subtitle: creci ? `CRECI ${creci} · ${email ?? ''}` : (email ?? 'sem e-mail'),
        media,
      }
    },
  },
})
