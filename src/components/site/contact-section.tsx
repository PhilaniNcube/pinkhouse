import { MapPin, MessageCircle, Phone } from 'lucide-react'

import { EnquiryForm } from '@/features/enquiries/enquiry-form'
import { Button } from '@/components/ui/button'
import { SITE } from '@/lib/site'

export function ContactSection() {
  return (
    <section className="section contact-section" id="contact">
      <div className="container">
        <div className="section-heading section-heading--split">
          <h2>Speak with Mrs Ncube</h2>
          <p className="lead">
            A house, a garden and a careful host.
          </p>
        </div>

        <div className="contact-panel">
          <div className="contact-card surface-dark">
            <div>
              <h3>Mrs Ncube</h3>
              <p className="contact-card__intro">
                Call or WhatsApp to ask about dates or the house.
              </p>
            </div>

            <div className="contact-card__details">
              <div className="contact-detail">
                <MapPin aria-hidden="true" size={18} strokeWidth={1.6} />
                <div>
                  <span>Address</span>
                  <p className="contact-detail__address">
                    2007 Makoni St, Mainway Meadows, Waterfalls, Harare
                  </p>
                  <a
                    href={SITE.mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-detail__map-link"
                  >
                    Open in maps
                  </a>
                </div>
              </div>

              <div className="contact-detail">
                <Phone aria-hidden="true" size={18} strokeWidth={1.6} />
                <div>
                  <span>Call or WhatsApp</span>
                  <a href={SITE.phoneHref} className="num">
                    {SITE.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>

            <div className="contact-card__actions">
              <Button asChild variant="primary">
                <a href={SITE.phoneHref}>
                  <Phone aria-hidden="true" size={16} strokeWidth={1.7} />
                  Call Mrs Ncube
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={SITE.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1.7}
                  />
                  WhatsApp
                </a>
              </Button>
            </div>

            <p className="contact-card__note">
              Please arrange your arrival before coming through the gate.
            </p>
          </div>

          <div className="contact-form-panel">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  )
}
