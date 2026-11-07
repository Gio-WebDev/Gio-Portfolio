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
async function findResume(filename) {
  try {
    const file = await readFile(path.join(root, 'public/resume', filename))
    if (file.subarray(0, 5).toString() === '%PDF-') return `/resume/${filename}`
    console.warn(
      `${filename} is not a valid PDF. Keeping the missing-file state.`,
    )
  } catch {
    /* Resume files are intentionally optional. */
  }
  return null
}
const resume = await findResume('Gio-Lopez-Resume.pdf')
const resumeWithPhoto = await findResume('Gio-Lopez-Resume-With-Photo.pdf')
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
  resumeWithPhoto,
  projects,
}
await writeFile(
  path.join(root, 'src/data/assets.generated.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)
console.log(
  `Assets: ${resume ? 'ATS resume found' : 'ATS resume pending'}, ${resumeWithPhoto ? 'photo resume found' : 'photo resume pending'}, ${Object.values(projects).flat().length} screenshots.`,
)
