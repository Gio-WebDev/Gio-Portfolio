import { useState } from 'react'
import { ArrowUpRight, ImageOff } from 'lucide-react'
import type { Project } from '../data/content'
import { assets } from '../data/assets'

export function ProjectVisual({
  project,
  gallery = false,
}: {
  project: Project
  gallery?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const screenshot = assets.projects[project.id]?.[0]
  if (screenshot && !failed)
    return (
      <div className={`project-visual ${project.id} has-screenshot`}>
        <img
          src={screenshot.src}
          alt={screenshot.alt}
          width="1200"
          height="760"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    )
  return (
    <div
      className={`project-visual ${project.id}${gallery ? ' gallery-placeholder' : ''}`}
    >
      <span className="visual-topline">
        ACADEMIC PROJECT <ArrowUpRight size={16} />
      </span>
      <div className="project-art" aria-hidden="true">
        <div className="art-ring" />
        <div className="art-ring ring-two" />
        <div className="art-ring ring-three" />
        <span className="project-art-title">
          {project.id === 'rizal'
            ? 'Rizal.'
            : project.title === 'BrewBite-MVC'
              ? 'BrewBite'
              : project.title}
        </span>
        <span className="project-art-subtitle">
          {project.id === 'poseidon'
            ? 'OBSERVE. UNDERSTAND. RESPOND.'
            : project.id === 'hanap'
              ? 'FIND A SKILL. MAKE A CONNECTION.'
              : project.id === 'brewbite'
                ? 'PHP / MODEL · VIEW · CONTROLLER'
                : 'AN ACADEMIC EDUCATIONAL GAME'}
        </span>
      </div>
      <span className="screenshot-pending">
        <ImageOff size={13} /> Project screenshot pending
      </span>
    </div>
  )
}
