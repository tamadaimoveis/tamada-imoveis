/**
 * Permite rodar `npx sanity [command]` nesta pasta.
 * https://www.sanity.io/docs/cli
 **/
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'v3whr4as',
    dataset: 'production',
  },
  // Sem isto o `sanity deploy` pergunta o application id a cada vez e trava em
  // execução não-interativa (CI, script).
  deployment: {
    appId: 'ty4hlllg1xtt77f8nywonc2z',
  },
})
