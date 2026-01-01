import { init, id } from "@instantdb/react"

const db = init({
  appId: import.meta.env.VITE_INSTANTDB_APP_ID,
  devtool: false,
})

export const addReaction = async (imageId, emoji, userId, username, imageData) => {
  try {
    await db.transact(
      db.tx.reactions[id()].update({
        imageId,
        emoji,
        userId,
        username,
        createdAt: Date.now(),
      }),
    )

    // Add to feed
    await db.transact(
      db.tx.feed_items[id()].update({
        type: "reaction",
        imageId,
        emoji,
        userId,
        username,
        createdAt: Date.now(),
        imageTitle: imageData?.alt_description || "Untitled Image",
      }),
    )
  } catch (error) {
    console.error("Error adding reaction:", error)
  }
}

export const addComment = async (imageId, text, userId, username, imageData) => {
  try {
    await db.transact(
      db.tx.comments[id()].update({
        imageId,
        text,
        userId,
        username,
        createdAt: Date.now(),
      }),
    )

    // Add to feed
    await db.transact(
      db.tx.feed_items[id()].update({
        type: "comment",
        imageId,
        commentText: text,
        userId,
        username,
        createdAt: Date.now(),
        imageTitle: imageData?.alt_description || "Untitled Image",
      }),
    )
  } catch (error) {
    console.error("Error adding comment:", error)
  }
}

export const deleteReaction = async (reactionId) => {
  try {
    await db.transact(db.tx.reactions[reactionId].delete())
  } catch (error) {
    console.error("Error deleting reaction:", error)
  }
}

export const deleteComment = async (commentId) => {
  try {
    await db.transact(db.tx.comments[commentId].delete())
  } catch (error) {
    console.error("Error deleting comment:", error)
  }
}
