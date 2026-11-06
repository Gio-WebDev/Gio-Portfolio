import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

export function Github({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.5c0-1 .1-1.6-.5-2.2 3.1-.3 6.5-1.5 6.5-7A5.5 5.5 0 0 0 19.5 5c.2-1.1.2-2.2-.1-3.2 0 0-1.2-.4-4.1 1.5a14 14 0 0 0-7.6 0C4.8 1.4 3.6 1.8 3.6 1.8A8 8 0 0 0 3.5 5 5.5 5.5 0 0 0 2 9.3c0 5.5 3.4 6.7 6.5 7-.6.6-.6 1.2-.5 2.2V22" />
    </svg>
  )
}

export function Linkedin({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7.5 10.5v7M11 17.5v-7h3v1c1-2 4-1.5 4 1.5v4.5M7.5 7h.01" />
    </svg>
  )
}
