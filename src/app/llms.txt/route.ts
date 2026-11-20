import { connection } from 'next/server'

import { buildLlmsIndexMarkdown } from '@/lib/llms'

export async function GET() {
  await connection()
  const markdown = await buildLlmsIndexMarkdown()

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      'X-Robots-Tag': 'all',
    },
  })
}
