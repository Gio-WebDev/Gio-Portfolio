import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const projectIds = ['poseidon', 'hanap', 'brewbite', 'rizal']
const images = /\.(avif|webp|png|jpe?g)$/i
for (const folder of [
  'images',
  'resume',
  ...projectIds.map((id) => `projects/${id}`),
])
  await mkdir(path.join(root, 'public', folder), { recursive: true })
const resumePath = path.join(root, 'public/resume/Gio-Lopez-Resume.pdf')
let resume = null
try {
  const file = await readFile(resumePath)
  if (file.subarray(0, 5).toString() === '%PDF-')
    resume = '/resume/Gio-Lopez-Resume.pdf'
  else
    console.warn(
      'Resume file is not a valid PDF. Keeping the missing-file state.',
    )
} catch {
  /* Resume is intentionally optional. */
}
const projects = {}
for (const id of projectIds) {
  const directory = path.join(root, 'public/projects', id)
  let captions = {}
  try {
    captions = JSON.parse(
      await readFile(path.join(directory, 'captions.json'), 'utf8'),
    )
  } catch {
    /* Captions can be added later. */
  }
  projects[id] = (await readdir(directory))
    .filter((file) => images.test(file))
    .sort()
    .map((file, index) => ({
      src: `/projects/${id}/${encodeURIComponent(file)}`,
      alt:
        typeof captions[file] === 'string'
          ? captions[file]
          : `${id === 'rizal' ? 'Rizal educational game' : id.toUpperCase()} — project screenshot ${index + 1}`,
    }))
}
const manifest = {
  resume,
  projects,
}
await writeFile(
  path.join(root, 'src/data/assets.generated.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)
console.log(
  `Assets: ${resume ? 'resume found' : 'resume pending'}, ${Object.values(projects).flat().length} screenshots.`,
)
