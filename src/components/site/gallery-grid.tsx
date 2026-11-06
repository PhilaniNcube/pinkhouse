'use client'

import { useState } from 'react'

import type { GalleryPhoto } from '@/features/home/home-data'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

interface GalleryGridProps {
  photos: GalleryPhoto[]
}

export function GalleryGrid({ photos }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const active = activeIndex === null ? null : photos[activeIndex]

  return (
    <>
      <div className="gallery-mosaic">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="gallery-item"
            onClick={() => setActiveIndex(index)}
            aria-label={`Open larger photograph: ${photo.title}`}
          >
            <img
              src={photo.thumbnail}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
            />
            <span className="gallery-item__caption">
              <span>{photo.title}</span>
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndex(null)
        }}
      >
        <DialogContent className="lightbox">
          {active ? (
            <>
              <DialogTitle className="lightbox__title">
                {active.title}
              </DialogTitle>
              <DialogDescription className="visually-hidden">
                A larger view of {active.title} at The Pink House.
              </DialogDescription>
              <div className="lightbox__image">
                <img
                  src={active.src}
                  alt={active.alt}
                  width={active.width}
                  height={active.height}
                />
              </div>
              <div className="lightbox__foot">
                <span>{active.category}</span>
                {active.credit ? (
                  <span>
                    Photograph:{' '}
                    {active.creditUrl ? (
                      <a
                        href={active.creditUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {active.credit}
                      </a>
                    ) : (
                      active.credit
                    )}
                  </span>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
