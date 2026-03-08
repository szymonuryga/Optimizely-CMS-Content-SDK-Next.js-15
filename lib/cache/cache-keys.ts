export const CACHE_KEYS = {
  FOOTER: 'optimizely-footer',
  HEADER: 'optimizely-header',
} as const

/**
 * Generates a cache tag by appending locale to the base key
 * @param baseKey - Base cache key (e.g., CACHE_KEYS.FOOTER)
 * @param locale - Locale identifier (e.g., 'en', 'pl', 'sv')
 * @returns Formatted cache tag (e.g., 'optimizely-footer-en')
 */
export function getCacheTag(
  baseKey: (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS],
  locale: string
): string {
  return `${baseKey}-${locale}`
}
