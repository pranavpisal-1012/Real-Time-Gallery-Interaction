import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { init } from "@instantdb/react"
import Gallery from "./components/Gallery"
import Feed from "./components/Feed"
import ImageModal from "./components/ImageModal"
import { useStore } from "./store/appStore"

const db = init({
  appId: import.meta.env.VITE_INSTANTDB_APP_ID,
  devtool: false,
})

const queryClient = new QueryClient()

export default function App() {
  const { selectedImageId } = useStore()

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full px-4 md:px-8 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">📸 Gallery</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Click on any image to interact with emojis and comments
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gallery Section */}
            <div className="lg:col-span-2">
              <Gallery />
            </div>

            {/* Feed Section */}
            <div>
              <Feed />
            </div>
          </div>

          {/* Image Modal */}
          {selectedImageId && <ImageModal />}
        </div>
      </div>
    </QueryClientProvider>
  )
}
