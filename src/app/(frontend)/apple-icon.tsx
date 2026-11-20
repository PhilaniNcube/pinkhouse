import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#4A1922',
          borderRadius: '38px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            letterSpacing: '-0.04em',
            fontWeight: 700,
            fontSize: 82,
          }}
        >
          <span style={{ color: '#F6DDE0' }}>P</span>
          <span style={{ color: '#DFB15B' }}>H</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
