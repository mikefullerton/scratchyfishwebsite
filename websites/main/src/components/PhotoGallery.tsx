'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Photo } from '@/lib/content'

/** Swipes shorter than this many pixels are taps, not page turns. */
const SWIPE_THRESHOLD = 50

/** The photo grid and its lightbox: click to open, arrows / keys / swipes to page, Esc to close. */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const touchStartX = useRef(0)
  const count = photos.length

  const showPrev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count])
  const showNext = useCallback(() => setIndex((i) => (i + 1) % count), [count])
  const close = useCallback(() => setOpen(false), [])
  const openAt = (i: number) => {
    setIndex(i)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowLeft') showPrev()
      if (event.key === 'ArrowRight') showNext()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, showPrev, showNext])

  const current = photos[index]

  return (
    <>
      <div className="photo-gallery" id="photoGallery">
        {photos.map((photo, i) => (
          // The figure itself is the control, as on the Jekyll page; role and key handling make it one.
          <figure
            key={photo.src}
            className="photo-item"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
            role="button"
            tabIndex={0}
            onClick={() => openAt(i)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openAt(i)
              }
            }}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </figure>
        ))}
      </div>

      <div className={open ? 'lightbox active' : 'lightbox'} id="lightbox">
        {/* Clicking the backdrop closes; keyboard users have Esc and the close button. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="lightbox-overlay" onClick={close}></div>
        <div className="lightbox-content">
          <button type="button" className="lightbox-close" onClick={close} aria-label="Close">
            &times;
          </button>
          <button type="button" className="lightbox-prev" onClick={showPrev} aria-label="Previous photo">
            &#8249;
          </button>
          <button type="button" className="lightbox-next" onClick={showNext} aria-label="Next photo">
            &#8250;
          </button>
          <div
            className="lightbox-image-container"
            onTouchStart={(event) => {
              touchStartX.current = event.changedTouches[0]?.screenX ?? 0
            }}
            onTouchEnd={(event) => {
              const diff = touchStartX.current - (event.changedTouches[0]?.screenX ?? touchStartX.current)
              if (Math.abs(diff) > SWIPE_THRESHOLD) {
                if (diff > 0) showNext()
                else showPrev()
              }
            }}
          >
            {open && current ? (
              <img className="lightbox-image" id="lightboxImage" src={current.src} alt={current.alt} />
            ) : null}
          </div>
          <div className="lightbox-counter" id="lightboxCounter">
            {open ? `${index + 1} / ${count}` : ''}
          </div>
        </div>
      </div>
    </>
  )
}
