import { useState } from 'react'
import { ArrowUpRight, Download, Eye, FileText, X } from 'lucide-react'
import { assets } from '../data/assets'

export function Resume() {
  const [preview, setPreview] = useState(false)
  return (
    <section
      className="resume-section section"
      id="resume"
      aria-labelledby="resume-heading"
    >
      <div className="container">
        <div className="resume-card" data-reveal>
          <div>
            <p className="eyebrow">
              <span>05</span> The paper version
            </p>
            <h2 id="resume-heading">
              A little more,
              <br />
              <span className="serif-accent">all in one place.</span>
            </h2>
            <p>
              My background, skills, and academic project experience in a format
              you can keep.
            </p>
          </div>
          <div className="resume-actions">
            <div className="resume-file">
              <FileText size={31} />
              <div>
                <strong>Gio Lopez — Resume</strong>
                <span>
                  {assets.resume ? 'PDF document' : 'PDF not available yet'}
                </span>
              </div>
              {assets.resume && <span className="file-type">PDF</span>}
            </div>
            {assets.resume ? (
              <>
                <div className="button-group">
                  <button
                    className="button primary"
                    onClick={() => setPreview(!preview)}
                  >
                    {preview ? <X size={16} /> : <Eye size={16} />}
                    {preview ? 'Close preview' : 'View resume'}
                  </button>
                  <a
                    href={assets.resume}
                    className="button secondary"
                    download="Gio-Lopez-Resume.pdf"
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
                <a
                  className="text-link"
                  href={assets.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in a new tab <ArrowUpRight size={15} />
                </a>
              </>
            ) : (
              <div className="missing-resume">
                <p>The resume PDF hasn’t been added to this portfolio yet.</p>
                <a
                  className="text-link"
                  href="mailto:lopezjgm999@gmail.com?subject=Resume%20request"
                >
                  Request a copy by email <ArrowUpRight size={15} />
                </a>
              </div>
            )}
          </div>
        </div>
        {preview && assets.resume && (
          <div className="resume-preview">
            <object
              data={assets.resume}
              type="application/pdf"
              aria-label="Gio Lopez resume PDF"
            >
              <p>
                Your browser doesn’t support embedded PDFs.{' '}
                <a
                  href={assets.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the resume in a new tab
                </a>{' '}
                or{' '}
                <a href={assets.resume} download>
                  download it
                </a>
                .
              </p>
            </object>
            <p>
              Can’t see the document?{' '}
              <a href={assets.resume} target="_blank" rel="noopener noreferrer">
                Open the PDF directly <ArrowUpRight size={13} />
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
