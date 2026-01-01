import { create } from "zustand"

export const useStore = create((set) => ({
  userId: typeof window !== "undefined" ? localStorage.getItem("userId") || generateId() : generateId(),
  username: typeof window !== "undefined" ? localStorage.getItem("username") || generateUsername() : generateUsername(),
  selectedImageId: null,

  setUserId: (userId) => set({ userId }),
  setUsername: (username) => set({ username }),
  setSelectedImageId: (imageId) => set({ selectedImageId: imageId }),
}))

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function generateUsername() {
  const colors = ["Red", "Blue", "Green", "Purple", "Orange", "Pink", "Yellow", "Cyan"]
  const animals = ["Panda", "Tiger", "Eagle", "Fox", "Wolf", "Bear", "Lion", "Shark"]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${color}${animal}`
}

// Initialize user data in localStorage
if (typeof window !== "undefined") {
  localStorage.setItem("userId", useStore.getState().userId)
  localStorage.setItem("username", useStore.getState().username)
}
