'use client'

/**
 * Configuração do Sanity Studio montado na rota `/studio`
 * (src/app/studio/[[...tool]]/page.tsx)
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {deletePropertyAction} from './src/sanity/actions/deletePropertyAction'
import {reapplyWatermarkAction} from './src/sanity/actions/reapplyWatermarkAction'

export default defineConfig({
  name: 'tamada',
  title: '🏢 Tamada Imóveis',
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  // groq2024: indexa o documento inteiro na busca da lista, então a equipe
  // acha o imóvel digitando o código (ex: AP9128).
  search: {strategy: 'groq2024'},
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'property') {
        const withoutDelete = prev.filter((action) => action.action !== 'delete')
        return [...withoutDelete, reapplyWatermarkAction, deletePropertyAction]
      }
      return prev
    },
  },
  plugins: [structureTool({structure}), visionTool({defaultApiVersion: apiVersion})],
})
