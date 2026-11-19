import { timingSafeEqual } from 'node:crypto'

/** Constant-time comparison that tolerates missing values. */
export function secretsMatch(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!provided || !expected) return false
  const providedBytes = Buffer.from(provided)
  const expectedBytes = Buffer.from(expected)
  if (providedBytes.length !== expectedBytes.length) return false
  return timingSafeEqual(providedBytes, expectedBytes)
}

export function bearerMatches(
  authorizationHeader: string | null,
  expectedSecret: string,
): boolean {
  if (!authorizationHeader) return false
  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return false
  return secretsMatch(token, expectedSecret)
}
