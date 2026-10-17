import React from 'react';

/**
 * Minimal asset card component to verify local asset resolution
 */
export default function AssetPreviewCard({ title, filename, description, tag }) {
  return (
    <div className="card-whimsical asset-card">
      <div className="asset-media-frame">
        <img
          src={`/assets/${filename}`}
          alt={title}
          className="asset-image"
          loading="lazy"
        />
      </div>
      <div className="asset-details">
        <div className="asset-meta">
          <span className="badge-berry">{tag}</span>
          <code className="asset-filename">/assets/{filename}</code>
        </div>
        <h3 className="asset-title">{title}</h3>
        <p className="asset-description">{description}</p>
      </div>
    </div>
  );
}

