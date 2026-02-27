const cache = new Map<string, string>()

export async function getStreetViewUrl(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<string> {
  const cacheKey = `${lat},${lng}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const satelliteUrl = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${lat},${lng}&zoom=15&maptype=satellite`

  let embedUrl: string
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=50&key=${apiKey}`,
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: { status: string } = await res.json()
    embedUrl =
      data.status === 'OK'
        ? `https://www.google.com/maps/embed/v1/streetview?location=${lat},${lng}&key=${apiKey}`
        : satelliteUrl
  } catch {
    embedUrl = satelliteUrl
  }

  cache.set(cacheKey, embedUrl)
  return embedUrl
}
