import 'dotenv/config'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})
try {
  const r = await s3.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, MaxKeys: 5 }))
  console.log('R2 list OK. objects:', (r.Contents || []).map((o) => o.Key))
} catch (e) {
  console.log('R2 list FAILED:', e.name, '-', e.message)
}
try {
  const res = await fetch(process.env.R2_PUBLIC_URL + '/')
  console.log('R2 public URL status:', res.status)
} catch (e) {
  console.log('R2 public URL FAILED:', e.message)
}
