import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ImageOff,
  Info,
  LockKeyhole,
  X,
} from 'lucide-react'
import { Github } from './BrandIcons'
import { projects } from '../data/content'
import type { Project } from '../data/content'
import { assets } from '../data/assets'
import { ProjectVisual } from './ProjectVisual'

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure>
      {failed ? (
        <p className="image-error">
          <ImageOff size={18} /> Screenshot unavailable
        </p>
      ) : (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${alt} (open full image in new tab)`}
        >
          <img
            src={src}
            alt={alt}
            width="1200"
            height="760"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </a>
      )}
      <figcaption>{alt}</figcaption>
    </figure>
  )
}

export function ProjectDialog({
  project,
  onClose,
  onSelect,
}: {
  project: Project
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const next =
    projects[
      (projects.findIndex((item) => item.id === project.id) + 1) %
        projects.length
    ]
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])
  useEffect(() => {
    dialog.current?.scrollTo(0, 0)
    document.getElementById('case-study-title')?.focus({ preventScroll: true })
    document.title = `${project.title} — Case Study | Gio Lopez`
    return () => {
      document.title = 'Gio Lopez — Aspiring Web Developer & UI/UX Designer'
    }
  }, [project])
  const screenshots = assets.projects[project.id] ?? []
  return (
    <dialog
      ref={dialog}
      className="project-dialog"
      aria-labelledby="case-study-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-content">
        <div className="dialog-toolbar">
          <span className="eyebrow">Selected work / {project.number}</span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close case study"
            autoFocus
          >
            <X size={22} />
          </button>
        </div>
        <div className="case-study-header">
          <p className="eyebrow">{project.category}</p>
          <h2 id="case-study-title" tabIndex={-1}>
            {project.title}
          </h2>
          <p>{project.subtitle}</p>
          <div className="case-meta">
            <div>
              <span>Context</span>
              <strong>{project.context}</strong>
            </div>
            <div>
              <span>My role</span>
              <strong>{project.role}</strong>
            </div>
          </div>
        </div>
        <ProjectVisual key={project.id} project={project} gallery />
        <div className="case-body">
          <section>
            <p className="eyebrow">The overview</p>
            <h3>A closer look.</h3>
            <p>{project.overview}</p>
          </section>
          <div className="case-two-column">
            <section>
              <h3>Problem &amp; purpose</h3>
              <p>{project.purpose}</p>
            </section>
            <section>
              <h3>Who it’s for</h3>
              <p>{project.users}</p>
            </section>
          </div>
          <section>
            <h3>Technologies</h3>
            {project.technologies.length ? (
              <div className="tags">
                {project.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            ) : (
              <p>
                The engine and development technologies have not been
                documented.
              </p>
            )}
          </section>
          <section>
            <h3>{project.featureLabel}</h3>
            {project.features.length ? (
              <ul className="feature-list">
                {project.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Additional verified materials are needed before specific
                features can be described.
              </p>
            )}
          </section>
          <section>
            <h3>My contribution</h3>
            <ul className="contribution-list">
              {project.contributions.map((contribution) => (
                <li key={contribution}>{contribution}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Screenshots</h3>
            {screenshots.length ? (
              <div className="screenshot-gallery">
                {screenshots.map((screenshot) => (
                  <GalleryImage key={screenshot.src} {...screenshot} />
                ))}
              </div>
            ) : (
              <div className="gallery-empty">
                <ImageOff size={24} />
                <p>Project screenshots haven’t been added yet.</p>
                <span>
                  Actual project images will appear here when available.
                </span>
              </div>
            )}
          </section>
          <aside className="verification-note">
            <Info size={18} />
            <div>
              <strong>Project context &amp; verification</strong>
              <p>{project.verification}</p>
            </div>
          </aside>
          {((project.repo && project.repoVerified) || project.demo) && (
            <div className="case-links">
              {project.repo && project.repoVerified && (
                <a
                  className="button secondary"
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={17} /> Supplied repository{' '}
                  <ArrowUpRight size={16} />
                </a>
              )}
              {project.demo && (
                <a
                  className="button secondary"
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LockKeyhole size={16} /> Admin application{' '}
                  <ArrowUpRight size={16} />
                </a>
              )}
              <small>
                {project.demo
                  ? 'Login required · Live availability unverified'
                  : 'Repository access is currently unverified.'}
              </small>
            </div>
          )}
          <button className="next-project" onClick={() => onSelect(next.id)}>
            <span>
              <small>Next project</small>
              <strong>{next.title}</strong>
            </span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </dialog>
  )
}
