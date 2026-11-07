import manifest from './assets.generated.json'

export interface Screenshot {
  src: string
  alt: string
}
export const assets = manifest as {
  resume: string | null
  projects: Record<string, Screenshot[]>
}
