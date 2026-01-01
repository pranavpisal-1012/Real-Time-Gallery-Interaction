"use client"

import { init } from "@instantdb/react"
import { useState } from "react"
import EmojiPicker from "./EmojiPicker"
import { useStore } from "../store/appStore"
import { addReaction } from "../lib/interactions"

const db = init({
  appId: import.meta.env.VITE_INSTANTDB_APP_ID,
  devtool: false,
})

export default function GalleryImage({ photo, onClick }) {
  const { userId, username } = useStore()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const { data } = db.useQuery({
    reactions: {
      $: {
        where: { imageId: photo.id },
      },
    },
  })

  const reactions = data?.reactions || []
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const existing = acc.find((r) => r.emoji === reaction.emoji)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ emoji: reaction.emoji, count: 1, userIds: [reaction.userId] })
    }
    return acc
  }, [])

  const handleEmojiSelect = async (emoji) => {
    await addReaction(photo.id, emoji, userId, username, photo)
    setShowEmojiPicker(false)
  }

  return (
    <div className="relative group cursor-pointer">
      <div
        onClick={onClick}
        className="relative h-56 md:h-64 overflow-hidden rounded-lg shadow-md hover:shadow-lg smooth-transition"
      >
        <img
          src={photo.urls.regular || "/placeholder.svg"}
          alt={photo.alt_description || "Gallery image"}
          className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 smooth-transition" />
      </div>

      {/* Reactions Display */}
      <div className="mt-2 flex flex-wrap gap-1 items-center">
        {groupedReactions.map((reaction) => (
          <button
            key={reaction.emoji}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 smooth-transition"
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs text-slate-600 dark:text-slate-300">{reaction.count}</span>
          </button>
        ))}

        {/* Add Reaction Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowEmojiPicker(!showEmojiPicker)
            }}
            className="inline-flex items-center justify-center w-7 h-7 text-lg rounded-full bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 smooth-transition"
            title="Add emoji"
          >
            +
          </button>
          {showEmojiPicker && (
            <div className="absolute top-8 left-0 z-50" onClick={(e) => e.stopPropagation()}>
              <EmojiPicker onSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
