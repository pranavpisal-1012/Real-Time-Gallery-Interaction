"use client"

import { init } from "@instantdb/react"
import { useStore } from "../store/appStore"
import { useEffect, useRef } from "react"

const db = init({
  appId: import.meta.env.VITE_INSTANTDB_APP_ID,
  devtool: false,
})

export default function Feed() {
  const { setSelectedImageId } = useStore()
  const feedEndRef = useRef(null)

  const { data, isLoading } = db.useQuery({
    feed_items: {},
  })

  const feedItems = Array.isArray(data?.feed_items)
    ? [...data.feed_items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    : []

  // Auto-scroll to latest item
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [feedItems])

  const getActivityText = (item) => {
    const title = item.imageTitle || "Untitled Image"
    if (item.type === "reaction") {
      return `${item.username} reacted ${item.emoji} on "${title}"`
    }
    if (item.type === "comment") {
      return `${item.username} commented on "${title}": "${item.commentText}"`
    }
    return ""
  }

  return (
    <div className="glass rounded-xl p-6 h-[calc(100vh-96px)] sticky top-8 overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Live Activity</h2>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-600 dark:text-slate-300 text-center py-8">Loading...</p>
        ) : feedItems.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300 text-center py-8">Waiting for interactions...</p>
        ) : (
          feedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedImageId(item.imageId)}
              className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg smooth-transition text-sm text-slate-900 dark:text-white hover:shadow-lg"
            >
              <p className="line-clamp-2">{getActivityText(item)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(item.createdAt).toLocaleTimeString()}
              </p>
            </button>
          ))
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  )
}
