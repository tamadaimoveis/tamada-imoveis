import type {StructureResolver} from 'sanity/structure'
import {UsageDashboard} from './components/UsageDashboard'

/**
 * Menu do Studio.
 *
 * Imóveis abre em pastas por tipo de oferta porque venda e locação são
 * operações diferentes na imobiliária — quem cuida de aluguel não quer
 * garimpar 318 imóveis no meio de 4.429. "Venda e Locação" aparece nas duas
 * listas de propósito: o imóvel está mesmo nas duas carteiras.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Conteúdo')
    .items([
      S.listItem()
        .title('📊 Monitor de Uso e Cotas')
        .child(S.component(UsageDashboard).title('Uso de Dados do Sanity').id('usage-dashboard')),

      S.divider(),

      S.listItem()
        .title('🏠 Imóveis')
        .schemaType('property')
        .child(
          S.list()
            .title('Imóveis')
            .items([
              S.listItem()
                .title('📋 Todos')
                .schemaType('property')
                .child(S.documentTypeList('property').title('Todos os Imóveis')),

              S.divider(),

              S.listItem()
                .title('💰 À Venda')
                .schemaType('property')
                .child(
                  S.documentTypeList('property')
                    .title('À Venda')
                    .filter('_type == "property" && oferta in ["venda", "venda_locacao"]')
                ),
              S.listItem()
                .title('🔑 Para Alugar')
                .schemaType('property')
                .child(
                  S.documentTypeList('property')
                    .title('Para Alugar')
                    .filter('_type == "property" && oferta in ["locacao", "venda_locacao"]')
                ),
              S.listItem()
                .title('💰🔑 Venda e Locação')
                .schemaType('property')
                .child(
                  S.documentTypeList('property')
                    .title('Venda e Locação')
                    .filter('_type == "property" && oferta == "venda_locacao"')
                ),

              S.divider(),

              S.listItem()
                .title('⭐ Destaques da Home')
                .schemaType('property')
                .child(
                  S.documentTypeList('property')
                    .title('Destaques da Home')
                    .filter('_type == "property" && featured == true')
                ),
              S.listItem()
                .title('🚫 Fora do Site')
                .schemaType('property')
                .child(
                  S.documentTypeList('property')
                    .title('Fora do Site')
                    .filter('_type == "property" && (publicarSite == false || status != "ativo")')
                ),
            ])
        ),

      S.listItem()
        .title('👤 Corretores')
        .schemaType('broker')
        .child(S.documentTypeList('broker').title('Corretores')),

      S.listItem()
        .title('📩 Leads')
        .schemaType('lead')
        .child(S.documentTypeList('lead').title('Leads').defaultOrdering([{field: 'criadoEm', direction: 'desc'}])),

      S.divider(),

      S.listItem()
        .title("🎨 Marca d'Água")
        .schemaType('watermarkSettings')
        .child(
          S.document()
            .schemaType('watermarkSettings')
            .documentId('watermarkSettings')
            .title("Configurações da Marca d'Água")
        ),

      S.listItem()
        .title('🏷️ Opções de Imóvel')
        .schemaType('imovelOptions')
        .child(
          S.document()
            .schemaType('imovelOptions')
            .documentId('imovelOptions')
            .title('Tags e Comodidades disponíveis')
        ),
    ])
