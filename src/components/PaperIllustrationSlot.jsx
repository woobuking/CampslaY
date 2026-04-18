import { useState } from 'react'

export default function PaperIllustrationSlot({ title, description, imageUrl, align = 'left' }) {
  const [failed, setFailed] = useState(false)
  const hasImage = Boolean(imageUrl) && !failed

  return (
    <div className={`paper-illustration-slot ${align === 'right' ? 'paper-illustration-slot-right' : ''}`}>
      {hasImage ? (
        <img
          src={imageUrl}
          alt=""
          className="paper-illustration-image"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="paper-illustration-empty">
          <p className="paper-illustration-empty-title">{title}</p>
          <p className="paper-illustration-empty-desc">{description}</p>
        </div>
      )}
    </div>
  )
}
