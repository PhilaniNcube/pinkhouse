import { connection } from 'next/server'

import { buildLlmsFullMarkdown } from '@/lib/llms'

export async function GET() {
  await connection()
  const markdown = await buildLlmsFullMarkdown()

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      'X-Robots-Tag': 'all',
    },
  })
}
