import type { GalleryPhoto } from '@/features/home/home-data'
import { GalleryGrid } from './gallery-grid'

interface GallerySectionProps {
  photos: GalleryPhoto[]
}

export function GallerySection({ photos }: GallerySectionProps) {
  return (
    <section className="section gallery-section" id="gallery">
      <div className="container">
        <div className="section-heading section-heading--split">
          <h2>A look around the house</h2>
          <p className="lead">
            The pale pink front, the chandelier lounge, four made-up beds, and
            a garden that stays neat all year.
          </p>
        </div>

        {photos.length ? (
          <GalleryGrid photos={photos} />
        ) : (
          <p className="empty-note">
            Photographs are being prepared. Ask Mrs Ncube for a look around by
            WhatsApp.
          </p>
        )}
      </div>
    </section>
  )
}
