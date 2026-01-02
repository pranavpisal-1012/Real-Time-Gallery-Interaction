# Interactive Image Gallery

A real-time interactive image gallery application built with React, InstantDB, and the Unsplash API. Users can browse photos, add emoji reactions, post comments, and see live activity feeds of all interactions.

## Features

- **Infinite Scroll Gallery**: Browse curated photos from Unsplash with automatic pagination
- **Real-time Reactions**: Add emoji reactions to any image with instant synchronization
- **Comment System**: Post and manage comments on images
- **Live Activity Feed**: See real-time updates of all user interactions
- **User Identity**: Automatic generation of anonymous usernames (e.g., "RedPanda", "BlueTiger")
- **Responsive Design**: Fully responsive UI with dark mode support

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Unsplash API access key
- InstantDB app ID

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-app-issues
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   VITE_INSTANTDB_APP_ID=your_instantdb_app_id_here
   ```

   **How to obtain API keys:**
   - **Unsplash**: Create an account at [unsplash.com/developers](https://unsplash.com/developers), create a new application, and copy your Access Key
   - **InstantDB**: Sign up at [instantdb.com](https://instantdb.com), create a new app, and copy your App ID

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

```bash
npm run build
npm run preview
```

## API Handling Strategy

### Unsplash API Integration

**Location**: `src/lib/unsplash.js`

The application uses three main Unsplash API endpoints:

1. **`fetchPhotos(page, perPage)`** - Retrieves paginated photo listings
   - Used by the infinite scroll gallery
   - Fetches 12 photos per page by default
   - Orders photos by latest first

2. **`fetchPhotoById(id)`** - Retrieves detailed information for a specific photo
   - Used when opening the image modal
   - Provides full photo metadata including author information


**API Key Management**: The Unsplash access key is stored in environment variables and accessed via `import.meta.env.VITE_UNSPLASH_ACCESS_KEY` to keep credentials secure.

**Error Handling**: All API calls include error handling that throws descriptive errors, which are caught by React Query's built-in error management.

### React Query Integration

**Location**: `src/App.jsx`, `src/components/Gallery.jsx`, `src/components/ImageModal.jsx`

React Query (@tanstack/react-query) is used to manage all external API calls:

- **Infinite Queries**: The gallery uses `useInfiniteQuery` for seamless pagination
- **Caching**: Photos are cached by React Query, reducing unnecessary API calls
- **Loading States**: Built-in loading and error states for better UX
- **Automatic Refetching**: Stale data is automatically refetched when needed

## InstantDB Schema & Usage

### What is InstantDB?

InstantDB is a real-time database that provides instant synchronization without backend code. It's a perfect fit for this application because:
- Zero backend configuration needed
- Real-time updates out of the box
- Simple declarative queries
- Built-in reactivity with React hooks

### Schema Design

The application uses three main collections in InstantDB:

#### 1. **reactions**
Stores emoji reactions to images.

```javascript
{
  id: string,           // Auto-generated unique ID
  imageId: string,      // Unsplash photo ID
  emoji: string,        // The emoji character (e.g., "❤️")
  userId: string,       // Anonymous user ID
  username: string,     // Generated username (e.g., "RedPanda")
  createdAt: number     // Timestamp in milliseconds
}
```

#### 2. **comments**
Stores user comments on images.

```javascript
{
  id: string,           // Auto-generated unique ID
  imageId: string,      // Unsplash photo ID
  text: string,         // Comment content
  userId: string,       // Anonymous user ID
  username: string,     // Generated username
  createdAt: number     // Timestamp in milliseconds
}
```

#### 3. **feed_items**
Stores activity feed entries for real-time updates.

```javascript
{
  id: string,           // Auto-generated unique ID
  type: string,         // "reaction" or "comment"
  imageId: string,      // Unsplash photo ID
  emoji: string,        // (Optional) For reaction type
  commentText: string,  // (Optional) For comment type
  userId: string,       // Anonymous user ID
  username: string,     // Generated username
  imageTitle: string,   // Image description for display
  createdAt: number     // Timestamp in milliseconds
}
```

### InstantDB Usage Patterns

**Location**: `src/lib/interactions.js`, components

#### 1. **Initialization**
```javascript
import { init, id } from "@instantdb/react"

const db = init({
  appId: import.meta.env.VITE_INSTANTDB_APP_ID,
  devtool: false
})
```

#### 2. **Reading Data with Queries**
```javascript
const { data, isLoading } = db.useQuery({
  reactions: {
    $: {
      where: { imageId: selectedImageId }
    }
  }
})
```

The `useQuery` hook automatically subscribes to real-time updates. When data changes in the database, the component re-renders with the new data.

#### 3. **Writing Data with Transactions**
```javascript
await db.transact(
  db.tx.reactions[id()].update({
    imageId,
    emoji,
    userId,
    username,
    createdAt: Date.now()
  })
)
```

Transactions are atomic and use the `id()` function to generate unique identifiers.

#### 4. **Deleting Data**
```javascript
await db.transact(
  db.tx.reactions[reactionId].delete()
)
```

### Why Multiple DB Instances?

You'll notice the app initializes InstantDB in multiple files (`App.jsx`, `Feed.jsx`, `ImageModal.jsx`, `GalleryImage.jsx`, `interactions.js`). This is intentional:

- Each component needs its own reactive hook connection
- InstantDB is lightweight and handles multiple instances efficiently
- Keeps components self-contained and testable
- All instances share the same underlying data

##  Key React Decisions

### State Management Architecture

**Zustand for Client State** (`src/store/appStore.js`)

The app uses Zustand for lightweight global state management:

```javascript
{
  userId: string,           // Persistent anonymous user ID
  username: string,         // Generated username
  selectedImageId: string   // Currently open image in modal
}
```

**Why Zustand?**
- Minimal boilerplate compared to Redux
- No context providers needed
- Simple and performant
- Perfect for small-to-medium applications
- Built-in persistence with localStorage integration

**InstantDB for Server State**

All data that needs real-time synchronization (reactions, comments, feed) is managed by InstantDB:
- Automatic real-time updates
- No manual cache invalidation
- Built-in optimistic updates
- Conflict resolution handled by the database

### Component Architecture

**Separation of Concerns**

1. **Presentational Components**: `EmojiPicker.jsx`, `GalleryImage.jsx`
   - Focus on UI rendering
   - Receive data via props
   - Minimal business logic

2. **Container Components**: `Gallery.jsx`, `Feed.jsx`, `ImageModal.jsx`
   - Handle data fetching
   - Manage component-level state
   - Coordinate user interactions

3. **Utility Modules**: `lib/unsplash.js`, `lib/interactions.js`
   - Pure functions for API calls
   - Reusable across components
   - Easy to test and modify

### React Patterns Used

#### 1. **Infinite Scroll with Intersection Observer**
`Gallery.jsx` implements infinite scrolling using the Intersection Observer API:
- More performant than scroll event listeners
- Triggers when sentinel element enters viewport
- Automatically fetches next page of photos

#### 2. **Optimistic UI Updates**
When users add reactions or comments, the UI updates immediately while InstantDB handles synchronization in the background.

#### 3. **Controlled Components**
Form inputs (comment textarea, emoji search) are fully controlled by React state for predictable behavior.

#### 4. **Conditional Rendering**
Extensive use of conditional rendering for loading states, empty states, and modals to provide clear user feedback.

#### 5. **Event Delegation and Propagation Control**
Modal and emoji picker use `stopPropagation()` to prevent unintended click-through events.

### Performance Optimizations

1. **React Query Caching**: Photos are cached to avoid redundant API calls
2. **Lazy Loading**: Images load on-demand as users scroll
3. **Minimal Re-renders**: Zustand ensures only subscribed components update
4. **InstantDB Subscriptions**: Only actively queried data creates reactive subscriptions

### React 19 Considerations

The app uses React 19.2.0, which includes:
- Automatic batching of state updates
- Improved concurrent rendering
- Better hydration error messages
- No major breaking changes affecting this app's patterns

## Challenges Faced and Solutions

### Challenge 1: Real-time Synchronization Across Components

**Problem**: Multiple components needed to display and update the same data (reactions, comments) without prop drilling.

**Solution**: 
- Used InstantDB's reactive queries with multiple `useQuery` hooks
- Each component subscribes independently to the data it needs
- InstantDB automatically synchronizes all subscriptions in real-time
- This eliminated the need for complex state lifting or context providers

### Challenge 2: Anonymous User Identity

**Problem**: Needed persistent user identification without authentication system.

**Solution**:
- Generate random user IDs and fun usernames (e.g., "PurpleWolf") on first visit
- Store in localStorage for persistence across sessions
- Initialize in Zustand store for global access
- Allows users to delete their own comments while maintaining simplicity

### Challenge 3: Duplicate Feed Entries

**Problem**: Both reactions and comments needed to appear in the activity feed, requiring dual writes.

**Solution**:
- Created separate `feed_items` collection optimized for display
- Write to both primary collection (reactions/comments) and feed_items in parallel
- Feed items include denormalized data (imageTitle) for better query performance
- Trade-off: Slightly more storage for much simpler queries

### Challenge 4: Infinite Scroll Performance

**Problem**: Traditional scroll event listeners can cause performance issues.

**Solution**:
- Implemented Intersection Observer API for efficient scroll detection
- Only triggers when sentinel element is visible
- React Query's `useInfiniteQuery` handles pagination state
- Photos load seamlessly as user scrolls

### Challenge 5: Emoji Picker UX

**Problem**: Needed searchable emoji picker without external dependencies.

**Solution**:
- Built custom `EmojiPicker` component with predefined emoji set
- Added search functionality with keyword matching
- Used absolute positioning to prevent layout shifts
- Implemented click-outside logic to close picker

### Challenge 6: Modal State Management

**Problem**: Opening image modal needed to coordinate between multiple data sources (Unsplash + InstantDB).

**Solution**:
- Stored `selectedImageId` in Zustand for global access
- React Query fetches full photo details only when modal opens
- InstantDB query filters reactions/comments by imageId
- All loading states handled independently for better UX

### Challenge 7: Group Aggregation for Reactions

**Problem**: Multiple users can react with the same emoji, needed to display counts.

**Solution**:
- Client-side aggregation using `reduce()` function
- Groups reactions by emoji and counts occurrences
- Alternative considered: InstantDB aggregation queries (not implemented due to simplicity needs)
- Current approach works well for expected data volume

## What I Would Improve With More Time

### 1. **Advanced InstantDB Features**

**Schema Improvements:**
- Add indexes on `imageId` and `createdAt` fields for faster queries
- Implement data validation rules at the database level
- Add TTL (time-to-live) for old feed items to prevent unbounded growth

**Real-time Presence:**
- Show active users viewing the same image
- Display "typing..." indicators when someone is writing a comment
- Implement cursor tracking for collaborative browsing

### 2. **Enhanced User Experience**

**Authentication:**
- Optional user accounts with profile pictures
- Link anonymous sessions to accounts later
- Social login (Google, GitHub) integration

**Advanced Interactions:**
- Reply threads on comments
- Ability to remove your own reactions
- Edit comments after posting
- Like/upvote comments
- Share images via generated links

**Better Search:**
- Actually implement the Unsplash search UI
- Filter gallery by categories or colors
- Save favorite images to collections

### 3. **Performance & Scalability**

**Optimizations:**
- Implement virtual scrolling for extremely long galleries
- Add service worker for offline support
- Progressive image loading (blur-up technique)
- Lazy load emoji picker component
- Debounce emoji search input

**Caching Strategy:**
- Implement proper cache invalidation
- Add cache warming for popular images
- Prefetch next page of images

### 4. **Code Quality**

**Testing:**
- Unit tests for utility functions (interactions, unsplash)
- Component tests with React Testing Library
- E2E tests with Playwright or Cypress
- Test InstantDB transactions with mock database

**Type Safety:**
- Migrate to TypeScript for better type safety
- Add PropTypes or TypeScript interfaces for all components
- Type InstantDB schema with proper interfaces

**Code Organization:**
- Extract common hooks (useReactions, useComments)
- Create custom hook for infinite scroll logic
- Add error boundary components
- Implement proper logging and error tracking

### 5. **Accessibility (a11y)**

- Add proper ARIA labels for all interactive elements
- Implement keyboard navigation for gallery and modal
- Add focus trap for modal
- Screen reader announcements for real-time updates
- High contrast mode support
- Reduce motion support for animations

### 6. **Features**

**Moderation:**
- Report inappropriate comments
- Admin interface for content management
- Spam detection for comments

**Analytics:**
- Track popular images
- User engagement metrics
- Heatmaps for emoji usage

**Customization:**
- User preferences (theme, layout)
- Custom emoji sets
- Adjustable gallery grid size

### 7. **DevOps & Deployment**

- CI/CD pipeline with automated tests
- Environment-specific configurations
- Performance monitoring (Sentry, LogRocket)
- CDN integration for faster image loading
- Proper environment variable validation
- Docker containerization

### 8. **Data Management**

**Feed Optimization:**
- Currently, feed items are never deleted, which could lead to performance issues
- Implement pagination or windowing for feed
- Archive old feed items after 30 days
- Add "Load more" functionality instead of showing all items

**Reaction Deduplication:**
- Currently, users can add the same emoji multiple times
- Add uniqueness constraint (imageId + userId + emoji)
- Implement toggle behavior (click again to remove)

### 9. **UI/UX Polish**

- Add loading skeletons instead of spinners
- Implement smooth transitions between gallery items
- Add image zoom functionality in modal
- Show notification toasts for actions (comment posted, reaction added)
- Add empty states with call-to-action
- Implement proper error states with retry buttons

### 10. **Documentation**

- Add JSDoc comments to all functions
- Create component documentation with examples
- Add architecture decision records (ADRs)
- Create troubleshooting guide
- Document InstantDB schema in detail

## 🛠️ Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **InstantDB** - Real-time database
- **React Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Utility-first CSS framework
- **Unsplash API** - Image source
- **PostCSS** - CSS processing


## Design Decisions

### Why No Backend?

This project demonstrates the power of modern frontend-only development:
- InstantDB eliminates the need for custom backend code
- Unsplash provides all image data via REST API
- Real-time features work without WebSocket implementation
- Faster development and simpler deployment

### Why React Query?

- Separates server state from client state clearly
- Built-in caching, retries, and error handling
- Perfect companion to InstantDB for external APIs
- Infinite query support out of the box

### Why Tailwind CSS?

- Rapid prototyping with utility classes
- Consistent design system
- Built-in responsive design utilities
- Small production bundle with PurgeCSS
- Easy dark mode implementation

