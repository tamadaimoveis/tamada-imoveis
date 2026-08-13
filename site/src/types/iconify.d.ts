import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type IconifyIconProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  icon?: string
}

// React 19 move o namespace JSX pra dentro do próprio pacote `react` —
// `declare global { namespace JSX }` sozinho não é mais suficiente.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': IconifyIconProps
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': IconifyIconProps
    }
  }
}

export {}
