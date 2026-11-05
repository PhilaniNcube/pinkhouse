import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents:true,
  partialPrefetching: true
}

export default withPayload(nextConfig)
