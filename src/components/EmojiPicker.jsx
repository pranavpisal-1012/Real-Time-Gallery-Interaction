"use client"

import { useState } from "react"

const EMOJIS = ["❤️", "😂", "😍", "🔥", "👍", "😢", "😡", "🤔", "👏", "🎉", "✨", "💯"]

const EMOJI_NAMES = {
  "❤️": "love heart",
  "😂": "laugh",
  "😍": "love eyes",
  "🔥": "fire hot",
  "👍": "thumbs up good",
  "😢": "sad cry",
  "😡": "angry mad",
  "🤔": "thinking hmm",
  "👏": "clap applause",
  "🎉": "party celebrate",
  "✨": "sparkle shine",
  "💯": "hundred perfect",
}

export default function EmojiPicker({ onSelect }) {
  const [search, setSearch] = useState("")

  const filtered = EMOJIS.filter((emoji) =>
    EMOJI_NAMES[emoji]?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="bg-white/10 dark:bg-slate-700/90 backdrop-blur-md border border-white/20 dark:border-slate-600/50 rounded-lg p-4 shadow-xl w-56">
      <input
        type="text"
        placeholder="Search emoji..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 mb-3 text-sm rounded bg-white/20 dark:bg-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-white/30 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="grid grid-cols-6 gap-2">
        {filtered.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-2xl hover:bg-white/30 dark:hover:bg-slate-500 rounded p-2 transition-all duration-300 flex items-center justify-center"
            title={EMOJI_NAMES[emoji]}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
