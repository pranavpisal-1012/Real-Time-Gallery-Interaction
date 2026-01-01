const UNSPLASH_API_BASE = "https://api.unsplash.com"
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

export const fetchPhotos = async (page = 1, perPage = 12) => {
  const response = await fetch(
    `${UNSPLASH_API_BASE}/photos?page=${page}&per_page=${perPage}&order_by=latest&client_id=${ACCESS_KEY}`,
  )
  if (!response.ok) throw new Error("Failed to fetch photos")
  return response.json()
}

export const fetchPhotoById = async (id) => {
  const response = await fetch(`${UNSPLASH_API_BASE}/photos/${id}?client_id=${ACCESS_KEY}`)
  if (!response.ok) throw new Error("Failed to fetch photo")
  return response.json()
}

export const searchPhotos = async (query, page = 1) => {
  const response = await fetch(`${UNSPLASH_API_BASE}/search/photos?query=${query}&page=${page}&client_id=${ACCESS_KEY}`)
  if (!response.ok) throw new Error("Failed to search photos")
  return response.json()
}
