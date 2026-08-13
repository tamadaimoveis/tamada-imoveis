import { type SchemaTypeDefinition } from 'sanity'
import { propertyType } from './propertyType'
import { watermarkSettingsType } from './watermarkSettings'
import { brokerType } from './brokerType'
import { imovelOptionsType } from './imovelOptionsType'
import { leadType } from './leadType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [propertyType, watermarkSettingsType, brokerType, imovelOptionsType, leadType],
}
