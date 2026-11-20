import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { SITE } from '@/lib/site'

export const alt =
  'The Pink House — Private 4-Bedroom Guesthouse & Intimate Garden Venue at 2007 Makoni St, Mainway Meadows, Waterfalls, Harare'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const heroBase64 = await readFile(
  join(process.cwd(), 'public/photos/country-gate.jpg'),
  'base64',
).catch(() => null)
const heroSrc = heroBase64 ? `data:image/jpeg;base64,${heroBase64}` : null

export default function OpenGraphImage() {

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#2B0E14',
          color: '#FAF3F3',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: heroSrc ? '60%' : '100%',
            height: '100%',
            padding: '56px 56px 52px 64px',
            borderTop: '8px solid #DFB15B',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: 16,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#DFB15B',
                fontWeight: 700,
              }}
            >
              <span>{SITE.domain}</span>
              <span style={{ color: '#9C787F' }}>•</span>
              <span style={{ color: '#E7CFD3' }}>Waterfalls, Harare</span>
            </div>

            <div
              style={{
                fontSize: 72,
                fontWeight: 300,
                lineHeight: 0.98,
                letterSpacing: '-0.04em',
                marginTop: '24px',
                color: '#FFF9FA',
              }}
            >
              The Pink House
            </div>

            <div
              style={{
                fontSize: 25,
                lineHeight: 1.42,
                color: '#E6CDD1',
                marginTop: '22px',
                maxWidth: '540px',
              }}
            >
              A private four-bedroom guesthouse and neat garden venue in
              peaceful Mainway Meadows, Waterfalls, Harare.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '32px',
                borderTop: '1px solid rgba(250, 243, 243, 0.18)',
                paddingTop: '22px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#DFB15B',
                    fontWeight: 700,
                  }}
                >
                  Overnight Stays
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 42,
                      fontWeight: 300,
                      color: '#FFF9FA',
                    }}
                  >
                    ${SITE.standardAccommodationRate}
                  </span>
                  <span style={{ fontSize: 16, color: '#D7B7BC' }}>
                    / night · full house
                  </span>
                </div>
              </div>

              <div
                style={{
                  width: '1px',
                  backgroundColor: 'rgba(250, 243, 243, 0.18)',
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#DFB15B',
                    fontWeight: 700,
                  }}
                >
                  Outdoor Functions
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 42,
                      fontWeight: 300,
                      color: '#FFF9FA',
                    }}
                  >
                    ${SITE.standardFunctionRate}
                  </span>
                  <span style={{ fontSize: 16, color: '#D7B7BC' }}>
                    up to {SITE.functionMaxGuests} guests
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 16,
                color: '#D7B7BC',
              }}
            >
              <span>2007 Makoni St, Mainway Meadows</span>
              <span style={{ color: '#DFB15B', fontWeight: 700 }}>
                {SITE.host} · {SITE.phoneDisplay}
              </span>
            </div>
          </div>
        </div>

        {heroSrc ? (
          <div
            style={{
              width: '40%',
              height: '100%',
              display: 'flex',
              position: 'relative',
              backgroundColor: '#3E151E',
            }}
          >
            <img
              src={heroSrc}
              alt="The Pink House garden gate"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '36px',
                right: '36px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                backgroundColor: '#FAF3F3',
                color: '#3B1219',
                padding: '14px 20px',
                borderTop: '4px solid #DFB15B',
                borderRadius: '4px',
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                2007
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: 13,
                  lineHeight: 1.25,
                }}
              >
                <span style={{ fontWeight: 700 }}>Makoni Street</span>
                <span>Harare, Zimbabwe</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    ),
    {
      ...size,
    },
  )
}
