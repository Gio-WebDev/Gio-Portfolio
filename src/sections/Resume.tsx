import { useState } from 'react'
import { ArrowUpRight, Download, Eye, FileText, X } from 'lucide-react'
import { assets } from '../data/assets'

export function Resume() {
  const [preview, setPreview] = useState(false)
  const [selectedId, setSelectedId] = useState('ats')
  const versions = [
    {
      id: 'ats',
      label: 'ATS · No photo',
      description: 'ATS resume · PDF · No photo',
      filename: 'Gio_Resume_ATS_No_Photo.pdf',
      src: assets.resume,
    },
    {
      id: 'photo',
      label: 'With photo',
      description: 'Resume · PDF · With photo',
      filename: 'Gio_Resume_With_Photo.pdf',
      src: assets.resumeWithPhoto,
    },
  ].filter((version) => version.src)
  const selected =
    versions.find((version) => version.id === selectedId) ?? versions[0]
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
                  {selected ? selected.description : 'PDF not available yet'}
                </span>
              </div>
              {selected && <span className="file-type">PDF</span>}
            </div>
            {versions.length > 1 && (
              <fieldset className="resume-variants">
                <legend>Resume version</legend>
                <div className="resume-options">
                  {versions.map((version) => (
                    <label className="resume-option" key={version.id}>
                      <input
                        type="radio"
                        name="resume-version"
                        value={version.id}
                        checked={selected.id === version.id}
                        onChange={() => setSelectedId(version.id)}
                      />
                      <span>{version.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {selected ? (
              <>
                <div className="button-group">
                  <button
                    className="button primary"
                    onClick={() => setPreview(!preview)}
                    aria-expanded={preview}
                    aria-controls={preview ? 'resume-preview' : undefined}
                  >
                    {preview ? <X size={16} /> : <Eye size={16} />}
                    {preview ? 'Close preview' : 'View resume'}
                  </button>
                  <a
                    href={selected.src!}
                    className="button secondary"
                    download={selected.filename}
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
                <a
                  className="text-link"
                  href={selected.src!}
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
        {preview && selected && (
          <div className="resume-preview" id="resume-preview">
            <object
              key={selected.id}
              data={selected.src!}
              type="application/pdf"
              aria-label="Gio Lopez resume PDF"
            >
              <p>
                Your browser doesn’t support embedded PDFs.{' '}
                <a
                  href={selected.src!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the resume in a new tab
                </a>{' '}
                or{' '}
                <a href={selected.src!} download={selected.filename}>
                  download it
                </a>
                .
              </p>
            </object>
            <p>
              Can’t see the document?{' '}
              <a href={selected.src!} target="_blank" rel="noopener noreferrer">
                Open the PDF directly <ArrowUpRight size={13} />
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
