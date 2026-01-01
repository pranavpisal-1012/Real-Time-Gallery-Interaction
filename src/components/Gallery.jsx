"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchPhotos } from "../lib/unsplash"
import { useStore } from "../store/appStore"
import GalleryImage from "./GalleryImage"
import { useRef, useEffect } from "react"

export default function Gallery() {
  const { setSelectedImageId } = useStore()
  const observerTarget = useRef(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["photos"],
    queryFn: ({ pageParam = 1 }) => fetchPhotos(pageParam),
    getNextPageParam: (lastPage, pages) => pages.length + 1,
    initialPageParam: 1,
  })

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const photos = data?.pages.flat() || []

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <GalleryImage key={photo.id} photo={photo} onClick={() => setSelectedImageId(photo.id)} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="py-8 text-center">
        {isFetchingNextPage && (
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        )}
      </div>
    </div>
  )
}
