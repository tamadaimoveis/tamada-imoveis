import { defineField, defineType } from 'sanity'

export const leadType = defineType({
  name: 'lead',
  title: 'Leads — Simulador',
  type: 'document',
  fields: [
    defineField({ name: 'nome',          title: 'Nome',           type: 'string' }),
    defineField({ name: 'telefone',      title: 'Telefone',       type: 'string' }),
    defineField({ name: 'email',         title: 'E-mail',         type: 'string' }),
    defineField({ name: 'valorImovel',   title: 'Valor do imóvel',type: 'number' }),
    defineField({ name: 'entrada',       title: 'Entrada',        type: 'number' }),
    defineField({ name: 'rendaFamiliar', title: 'Renda familiar', type: 'number' }),
    defineField({ name: 'prazoAnos',     title: 'Prazo (anos)',   type: 'number' }),
    defineField({ name: 'gclid',         title: 'Google Click ID', type: 'string', description: 'Carimbo do clique no anúncio do Google Ads, capturado no navegador. Usar pra subir venda fechada como Offline Conversion.' }),
    defineField({ name: 'fbclid',        title: 'Meta Click ID',   type: 'string', description: 'Carimbo do clique no anúncio da Meta, capturado no navegador.' }),
    defineField({ name: 'fechou',        title: 'Fechou venda?',  type: 'boolean', initialValue: false, description: 'Marcar quando o corretor confirmar que este lead virou venda.' }),
    defineField({ name: 'valorFechamento', title: 'Valor da venda', type: 'number', description: 'Preencher só quando "Fechou venda?" estiver marcado. Usado pra subir a conversão real de volta pro Google/Meta.' }),
    defineField({ name: 'criadoEm',      title: 'Data',           type: 'datetime' }),
  ],
  preview: {
    select: { title: 'nome', subtitle: 'telefone', description: 'email' },
    prepare({ title, subtitle, description }) {
      return { title: title || 'Lead sem nome', subtitle: `${subtitle ?? ''} · ${description ?? ''}` }
    },
  },
})
