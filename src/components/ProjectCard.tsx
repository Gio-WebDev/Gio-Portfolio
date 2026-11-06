import { ArrowUpRight } from 'lucide-react'
import { Github } from './BrandIcons'
import type { Project } from '../data/content'
import { ProjectVisual } from './ProjectVisual'

export function ProjectCard({
  project,
  onSelect,
}: {
  project: Project
  onSelect: () => void
}) {
  return (
    <article
      className={`project-card ${project.id === 'poseidon' ? 'featured-project' : ''}`}
    >
      <button
        className="project-image-button"
        onClick={onSelect}
        aria-label={`View ${project.title} case study`}
      >
        <ProjectVisual project={project} />
      </button>
      <div className="project-card-content">
        <div className="project-category">
          {project.category}
          <span>{project.number}</span>
        </div>
        <h3>
          <button onClick={onSelect}>
            {project.title}
            <ArrowUpRight size={22} />
          </button>
        </h3>
        {project.id === 'poseidon' && (
          <p className="project-subtitle">{project.subtitle}</p>
        )}
        <p className="project-description">{project.description}</p>
        <div className="tags">
          {project.technologies
            .slice(0, project.id === 'poseidon' ? 5 : 3)
            .map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          {!project.technologies.length && (
            <span>Technology not documented</span>
          )}
        </div>
        <div className="project-card-footer">
          <button className="text-link" onClick={onSelect}>
            View case study <ArrowUpRight size={16} />
          </button>
          {project.repo && project.repoVerified && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-link"
              aria-label={`${project.title} repository (opens in new tab)`}
            >
              <Github size={16} />
              <span>Repository</span>
            </a>
          )}
          {project.demo && project.demoVerified && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer">
              Live demo <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
