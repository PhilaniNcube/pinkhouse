import type { MetadataRoute } from 'next'

import { SITE } from '@/lib/site'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(
  /\/$/,
  '',
)

const PUBLIC_ALLOW = ['/', '/llms.txt', '/llms-full.txt']
const PRIVATE_DISALLOW = ['/admin', '/admin/', '/api/', '/_next/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: PUBLIC_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-SearchBot',
          'Claude-User',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'GoogleOther',
          'Applebot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'Meta-ExternalFetcher',
          'Amazonbot',
          'DuckAssistBot',
          'MistralAI-User',
          'cohere-ai',
          'YouBot',
        ],
        allow: PUBLIC_ALLOW,
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
