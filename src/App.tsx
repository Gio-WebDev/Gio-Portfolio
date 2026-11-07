import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Download,
  ExternalLink,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Menu,
  Monitor,
  PenTool,
  Smartphone,
  X,
} from 'lucide-react'
import { Github, Linkedin } from './components/BrandIcons'
import { projects, skills, profile } from './data/content'
import { assets } from './data/assets'
import { ProjectCard } from './components/ProjectCard'
import { ProjectDialog } from './components/ProjectDialog'
import { ContactForm } from './components/ContactForm'
import { Resume } from './sections/Resume'
import { usePageEffects } from './hooks/usePageEffects'
import './App.css'

const navigation = [
  ['home', 'Home'],
  ['about', 'About'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['education', 'Education'],
  ['resume', 'Resume'],
  ['contact', 'Contact'],
] as const

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [portraitFailed, setPortraitFailed] = useState(false)
  const [selected, setSelected] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('project'),
  )
  const [filter, setFilter] = useState('All projects')
  const active = usePageEffects()

  useEffect(() => {
    const sync = () =>
      setSelected(new URLSearchParams(window.location.search).get('project'))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        document.getElementById('menu-toggle')?.focus()
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])

  function selectProject(id: string | null) {
    const url = new URL(window.location.href)
    if (id) url.searchParams.set('project', id)
    else url.searchParams.delete('project')
    window.history.pushState({}, '', url)
    setSelected(id)
  }

  const selectedProject = projects.find((project) => project.id === selected)
  const filtered = projects.filter(
    (project) => filter === 'All projects' || project.filters.includes(filter),
  )

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container nav-inner">
          <a
            className="wordmark"
            href="#home"
            aria-label="Gio Lopez, home"
            onClick={() => setMenuOpen(false)}
          >
            gio<span>.</span>
          </a>
          <button
            id="menu-toggle"
            className="menu-toggle icon-button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav
            id="main-navigation"
            className={menuOpen ? 'navigation is-open' : 'navigation'}
            aria-label="Main navigation"
          >
            {navigation.map(([id, name]) => (
              <a
                href={`#${id}`}
                key={id}
                aria-current={active === id ? 'location' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {name}
                {id === 'contact' && <ArrowUpRight size={14} />}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main">
        <section
          className="hero container"
          id="home"
          aria-labelledby="hero-heading"
        >
          <div className="hero-copy">
            <span className="availability">
              <span /> Available for internship / OJT
            </span>
            <p className="eyebrow hero-intro">
              Hello, I’m Gio Lopez <span className="intro-line" />
            </p>
            <h1 id="hero-heading">
              Thoughtful
              <br />
              <span className="serif-accent">interfaces.</span>
              <br />
              Practical applications.
            </h1>
            <p className="hero-description">
              Aspiring Web Developer &amp; UI/UX Designer.
              <br />
              An IT student turning ideas into clear, usable experiences for the
              web and beyond.
            </p>
            <div className="button-group hero-actions">
              <a className="button primary" href="#projects">
                Explore my work <ArrowDownRight size={18} />
              </a>
              {assets.resume ? (
                  <a className="button secondary" href={assets.resume} download="Gio_Resume_ATS_No_Photo.pdf">
                  Download resume <Download size={16} />
                </a>
              ) : (
                <a className="button secondary" href="#resume">
                  Resume <ArrowUpRight size={16} />
                </a>
              )}
            </div>
            <div className="hero-social">
              <span>Find me on</span>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gio Lopez on GitHub (opens in new tab)"
              >
                <Github size={18} /> GitHub <ArrowUpRight size={12} />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gio Lopez on LinkedIn (opens in new tab)"
              >
                <Linkedin size={17} /> LinkedIn <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="profile-frame">
              <div className="profile-topline">
                <span>THE PERSON BEHIND THE PIXELS</span>
                <span>01 / GL</span>
              </div>
              {assets.portrait && !portraitFailed ? (
                <img
                  className="portrait"
                  onError={() => setPortraitFailed(true)}
                  src={assets.portrait}
                  width="680"
                  height="820"
                  alt="Jose Giovanni Miguel T. Lopez"
                  fetchPriority="high"
                />
              ) : (
                <div
                  className="portrait-placeholder"
                  role="img"
                  aria-label="GL monogram. Gio’s professional photograph has not been added yet."
                >
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <span className="monogram">
                    g<span>l</span>
                    <i>.</i>
                  </span>
                  <span className="portrait-note">
                    A face to the name, soon.
                    <br />
                    <small>Profile photograph pending</small>
                  </span>
                  <span className="cross cross-one">+</span>
                  <span className="cross cross-two">+</span>
                </div>
              )}
              <div className="profile-caption">
                <div>
                  <strong>Gio Lopez</strong>
                  <span>Curious by nature. Thoughtful by design.</span>
                </div>
                <ArrowUpRight size={25} />
              </div>
            </div>
            <div className="location-stamp">
              <MapPin size={16} />
              <span>Based in Bulacan, Philippines</span>
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#projects">
              <ArrowDown size={15} /> A little further, a little more about me
            </a>
            <span>DESIGN WITH INTENT. BUILD WITH CARE.</span>
          </div>
        </section>

        <section
          className="projects-section section"
          id="projects"
          aria-labelledby="projects-heading"
        >
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <p className="eyebrow">
                  <span>01</span> Selected work
                </p>
                <h2 id="projects-heading">
                  Ideas into <span className="serif-accent">interfaces.</span>
                </h2>
              </div>
              <p>
                A selection of academic projects.
                <br />
                Different problems. A thoughtful approach.
              </p>
            </div>
            <div className="project-filters" aria-label="Filter projects">
              {['All projects', 'Web & mobile', 'Educational'].map((item) => (
                <button
                  key={item}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                  {item === 'All projects' && <span>04</span>}
                </button>
              ))}
            </div>
            <div className="project-grid">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={() => selectProject(project.id)}
                />
              ))}
            </div>
            <p className="work-note">
              <span /> Built as part of my learning journey. Roles and project
              context are included in each case study.
            </p>
          </div>
        </section>

        <section
          className="about-section section container"
          id="about"
          aria-labelledby="about-heading"
        >
          <div className="about-heading" data-reveal>
            <p className="eyebrow">
              <span>02</span> A little about me
            </p>
            <h2 id="about-heading">
              Good design starts
              <br />
              with <span className="serif-accent">understanding.</span>
            </h2>
            <div className="about-signature">
              Gio Lopez
              <span>Designer in the making. Developer in practice.</span>
            </div>
          </div>
          <div className="about-copy" data-reveal>
            <p className="large-copy">
              I’m Jose Giovanni Miguel T. Lopez. Most people call me Gio.
            </p>
            <p>
              I’m a BS Information Technology student at National University –
              Baliwag, specializing in Mobile and Web Application Development.
              I’m most drawn to UI/UX: how an interface feels, how clearly it
              communicates, and how easily someone can use it.
            </p>
            <p>
              Academic projects like HANAP and POSEIDON have given me experience
              in web and mobile development, UI design, and documentation.
              They’ve also taught me to listen to teammates, work through
              problems patiently, and explain the decisions behind the work.
            </p>
            <p>
              I’m looking for an internship where I can contribute, learn from
              experienced people, and keep getting better at building useful
              software.
            </p>
            <div className="about-values">
              <span>
                <Check size={15} /> Patient problem-solver
              </span>
              <span>
                <Check size={15} /> Collaborative teammate
              </span>
              <span>
                <Check size={15} /> Always learning
              </span>
            </div>
            <div className="education-note">
              <GraduationCap size={24} />
              <div>
                <strong>BS Information Technology</strong>
                <span>National University – Baliwag</span>
                <small>Mobile and Web Application Development</small>
              </div>
            </div>
          </div>
        </section>

        <section
          className="skills-section section"
          id="skills"
          aria-labelledby="skills-heading"
        >
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <p className="eyebrow">
                  <span>03</span> My toolkit
                </p>
                <h2 id="skills-heading">
                  A foundation to{' '}
                  <span className="serif-accent">build on.</span>
                </h2>
              </div>
              <p>
                Tools I’ve worked with through academic projects.
                <br />
                Always room to learn something new.
              </p>
            </div>
            <div className="skills-grid">
              {skills.map((group, index) => {
                const Icon = [
                  PenTool,
                  Monitor,
                  Code2,
                  Smartphone,
                  Code2,
                  Monitor,
                ][index]
                return (
                  <article
                    className="skill-group"
                    key={group.title}
                    data-reveal
                  >
                    <div className="skill-heading">
                      <Icon size={21} />
                      <span>0{index + 1}</span>
                    </div>
                    <h3>{group.title}</h3>
                    <div className="skill-tags">
                      {group.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                    {group.note && <p>{group.note}</p>}
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section
          className="education-section section container"
          id="education"
          aria-labelledby="education-heading"
        >
          <div data-reveal>
            <p className="eyebrow">
              <span>04</span> Education &amp; experience
            </p>
            <h2 id="education-heading">
              Learning through
              <br />
              <span className="serif-accent">doing.</span>
            </h2>
            <p className="section-intro">
              My experience so far is rooted in the classroom, collaboration,
              and building projects.
            </p>
            <span className="academic-label">
              <GraduationCap size={17} /> Academic experience
            </span>
          </div>
          <div className="timeline">
            <article data-reveal>
              <span className="timeline-dot" />
              <p className="eyebrow">Education</p>
              <h3>National University – Baliwag</h3>
              <strong>Bachelor of Science in Information Technology</strong>
              <p>Specialization in Mobile and Web Application Development.</p>
              <span className="timeline-tag">
                BSIT student · Seeking OJT / internship
              </span>
            </article>
            <article data-reveal>
              <span className="timeline-dot" />
              <p className="eyebrow">Three-member capstone team</p>
              <h3>POSEIDON</h3>
              <strong>Web development · UI design · Documentation</strong>
              <p>
                Contributed to the web application, interface design, project
                documentation, and preparation and presentation for the capstone
                defense.
              </p>
              <button
                className="text-link"
                onClick={() => selectProject('poseidon')}
              >
                Explore the project <ArrowUpRight size={15} />
              </button>
            </article>
            <article data-reveal>
              <span className="timeline-dot" />
              <p className="eyebrow">Individual academic project</p>
              <h3>HANAP</h3>
              <strong>Full-Stack Developer &amp; UI Designer</strong>
              <p>
                Worked on a web and mobile application connecting clients with
                local skilled workers, using React, Flutter, and Supabase.
              </p>
              <button
                className="text-link"
                onClick={() => selectProject('hanap')}
              >
                Explore the project <ArrowUpRight size={15} />
              </button>
            </article>
          </div>
        </section>

        <Resume />

        <section
          className="contact-section section"
          id="contact"
          aria-labelledby="contact-heading"
        >
          <div className="container contact-grid">
            <div className="contact-copy" data-reveal>
              <p className="eyebrow">
                <span>06</span> Let’s connect
              </p>
              <h2 id="contact-heading">
                Something good
                <br />
                starts with <span className="serif-accent">hello.</span>
              </h2>
              <p>
                I’m looking for an OJT or internship opportunity in web
                development, UI/UX design, software development, or IT support.
                I’d love to hear about your team.
              </p>
              <a className="email-link" href={`mailto:${profile.email}`}>
                {profile.email}
                <ArrowUpRight size={21} />
              </a>
              <div className="contact-social">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={18} /> GitHub <ExternalLink size={13} />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={18} /> LinkedIn <ExternalLink size={13} />
                </a>
              </div>
              <p className="contact-location">
                <MapPin size={15} /> San Miguel, Bulacan, Philippines
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="site-footer container">
        <div className="footer-top">
          <a
            className="wordmark"
            href="#home"
            aria-label="Gio Lopez, back to top"
          >
            gio<span>.</span>
          </a>
          <p>Thoughtful interfaces. Practical applications.</p>
          <a className="text-link" href="#home">
            Back to top <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Gio Lopez</span>
          <nav aria-label="Footer navigation">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#resume">Resume</a>
            <a href={`mailto:${profile.email}`} aria-label="Email Gio">
              <Mail size={15} />
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in new tab)"
            >
              <Github size={15} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn (opens in new tab)"
            >
              <Linkedin size={15} />
            </a>
          </nav>
          <span className="footer-credit">
            Made with care <Heart size={12} />
          </span>
        </div>
      </footer>

      {selectedProject && (
        <ProjectDialog
          project={selectedProject}
          onClose={() => selectProject(null)}
          onSelect={selectProject}
        />
      )}
      {selected && !selectedProject && (
        <div className="invalid-project" role="alert">
          This project couldn’t be found.{' '}
          <button onClick={() => selectProject(null)}>
            Return to portfolio <ArrowRight size={14} />
          </button>
        </div>
      )}
    </>
  )
}

export default App
