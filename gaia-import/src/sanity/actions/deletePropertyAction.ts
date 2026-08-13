import { TrashIcon } from '@sanity/icons'
import { useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity'

/**
 * Ação customizada: Excluir Imóvel
 *
 * Customiza o label e confirmação em português para facilitar uso pela equipe.
 */
export const deletePropertyAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, onComplete, published, draft } = props
  const client = useClient({ apiVersion: '2026-04-15' })

  return {
    label: 'Excluir Imóvel',
    icon: TrashIcon,
    tone: 'critical',
    onHandle: async () => {
      const title =
        (published as { title?: string })?.title ||
        (draft as { title?: string })?.title ||
        'este imóvel'

      const confirmed = window.confirm(
        `⚠ ATENÇÃO: Excluir "${title}"?\n\n` +
          `Esta ação é PERMANENTE e não pode ser desfeita.\n\n` +
          `Sugestão: Se o imóvel foi vendido ou está temporariamente fora do ar, ` +
          `use o campo "Status do Imóvel" ao invés de excluir — você mantém o histórico.\n\n` +
          `Tem certeza que quer EXCLUIR permanentemente?`
      )

      if (!confirmed) {
        onComplete()
        return
      }

      try {
        if (published) await client.delete(id)
        if (draft) await client.delete(`drafts.${id}`)
        onComplete()
      } catch (err) {
        alert(`Erro ao excluir: ${(err as Error).message}`)
        onComplete()
      }
    },
  }
}
