import React, { useState } from 'react';

export default function ProjectCard({
  title,
  category,
  description,
  tags = [],
  status,
  imageSrc,
  customGraphic,
  blueprintNotes,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="project-card">
      <div className="project-media-frame">
        <div className="project-badge-overlay">
          <span className="badge badge-berry">{category}</span>
        </div>

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="project-img"
            loading="lazy"
          />
        ) : (
          customGraphic
        )}
      </div>

      <div className="project-card-body">
        <h3 className="project-title">{title}</h3>
        <p className="project-text">{description}</p>

        <div className="project-tags">
          {tags.map((tag) => (
            <span key={tag} className="project-tag-pill">
              {tag}
            </span>
          ))}
        </div>

        <div className="project-card-footer">
          <span className="project-status-note">● {status}</span>
          <button
            type="button"
            className="project-inspect-btn"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide Blueprint' : 'Inspect Blueprint'}
          </button>
        </div>
      </div>

      <div className={`project-blueprint-panel ${expanded ? 'is-expanded' : ''}`}>
        <p className="blueprint-header">Workshop Log & Blueprint Specs</p>
        <p className="blueprint-text">{blueprintNotes}</p>
      </div>
    </article>
  );
}

