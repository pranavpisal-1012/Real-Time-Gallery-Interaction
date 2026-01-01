"use client"

import { init } from "@instantdb/react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchPhotoById } from "../lib/unsplash"
import { useStore } from "../store/appStore"
import { addReaction, addComment, deleteComment } from "../lib/interactions"
import EmojiPicker from "./EmojiPicker"

const db = init({
  appId: import.meta.env.VITE_INSTANTDB_APP_ID,
  devtool: false,
})

export default function ImageModal() {
  const { selectedImageId, setSelectedImageId, userId, username } = useStore()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: photo, isLoading } = useQuery({
    queryKey: ["photo", selectedImageId],
    queryFn: () => fetchPhotoById(selectedImageId),
    enabled: !!selectedImageId,
  })

  const { data } = db.useQuery({
    reactions: {
      $: {
        where: { imageId: selectedImageId },
      },
    },
    comments: {
      $: {
        where: { imageId: selectedImageId },
      },
    },
  })

  const reactions = data?.reactions || []
  const comments = data?.comments || []

  const groupedReactions = reactions.reduce((acc, reaction) => {
    const existing = acc.find((r) => r.emoji === reaction.emoji)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({
        emoji: reaction.emoji,
        count: 1,
        userIds: [reaction.userId],
      })
    }
    return acc
  }, [])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmitting(true)
    try {
      await addComment(selectedImageId, commentText, userId, username, photo)
      setCommentText("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmojiSelect = async (emoji) => {
    await addReaction(selectedImageId, emoji, userId, username, photo)
    setShowEmojiPicker(false)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId)
  }

  if (isLoading || !photo) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={() => setSelectedImageId(null)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl md:max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative">
          <button
            onClick={() => setSelectedImageId(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 smooth-transition z-10 flex items-center justify-center"
          >
            ✕
          </button>
          <img
            src={photo.urls.regular || "/placeholder.svg"}
            alt={photo.alt_description || "Image"}
            className="w-full h-auto"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {photo.alt_description || "Untitled"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              by{" "}
              <a
                href={photo.user.links.html}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                {photo.user.name}
              </a>
            </p>
          </div>

          {/* Emoji Reactions */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Reactions</h3>
            <div className="flex flex-wrap gap-2 items-center">
              {groupedReactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 smooth-transition"
                >
                  <span className="text-lg">{reaction.emoji}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{reaction.count}</span>
                </button>
              ))}

              {/* Add Emoji Button */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 smooth-transition text-xl"
                  title="Add emoji reaction"
                >
                  😊
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-12 left-0 z-50">
                    <EmojiPicker onSelect={handleEmojiSelect} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Comments ({comments.length})</h3>

            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{comment.username}</p>
                      {comment.userId === userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-500 hover:text-red-700 smooth-transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{comment.text}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg smooth-transition"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
