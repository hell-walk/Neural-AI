# AI Resume Analyzer - Project Summary & Learning Notes

## Core Technologies Stack
* **Framework:** React + Remix (Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Custom CSS (`app.css`, `auth.css`)
* **State Management:** Zustand (`usePuterStore`)
* **Animations:** Framer Motion + `react-type-animation`
* **Backend/Auth/Storage:** Puter.js (Puter SDK)

---

## Key Features & Implementations

### 1. Authentication System (`Puter.js`)
* **Implementation:** Built a custom global store using Zustand (`app/lib/puter.ts`) that initializes the Puter SDK and manages global user state (`user`, `isAuthenticated`, `isLoading`).
* **Race Condition Fix:** Fixed an issue where the app wouldn't instantly recognize a login by forcefully fetching the user object (`await puter.auth.getUser()`) immediately after `puter.auth.signIn()` resolved successfully, bypassing the slower `checkAuthStatus()` interval.
* **Initialization Loop Fix:** Implemented a global `isPuterInitializing` flag to prevent React Strict Mode from spamming the `setInterval` initialization loop, drastically improving app performance.

### 2. UI/UX Design & CSS
* **Custom CSS Extraction:** Extracted complex gradients, `clamp()` typography, and pseudo-elements (`::before`, `::after` for background blobs) into a dedicated `auth.css` file.
* **Component Specific Imports:** Used Vite's specific URL import syntax (`import styles from "../styles/auth.css?url"`) and Remix's `links` function to cleanly inject stylesheets only when needed.

### 3. "Demo Mode" Logic
* **Implementation:** Created a safe "Try Demo" pathway.
* **URL Parameters:** Used `URLSearchParams(window.location.search)` to check for `?demo=true`.
* **Interaction Blocking:** Overlayed a transparent `div` (`absolute inset-0 z-10`) over the main content in demo mode to prevent clicks, firing an `alert()` asking users to log in if they attempt to interact.
* **Dynamic Header Navigation:** Updated the Navbar to hide the "Upload" button and swap "Log Out" for "Log In" when in demo mode.

### 4. Advanced File Uploading (`react-dropzone`)
* **Component Extraction:** Moved complex upload logic out of the main page and into a dedicated `FileUploader.tsx` component to keep code clean.
* **`react-dropzone` Integration:** Replaced manual DOM drag events with the `useDropzone` hook.
* **Validation:** 
  * Restricted uploads to PDFs and Word Docs (`accept` prop).
  * Enforced a strict 10MB file size limit (`maxSize`).
  * Restricted users to uploading exactly 1 file at a time (`maxFiles: 1`, `multiple: false`).
* **Error Handling:** Used `FileRejection` to catch specific error codes (`too-many-files`, `file-too-large`, `file-invalid-type`) and display targeted `alert()` messages.
* **Byte Formatting:** Wrote a mathematical `formatSize` function to convert raw byte numbers into human-readable strings (KB, MB).

### 5. Complex UI State Management (The "Either/Or" Form)
* **Form Validation:** Built a form that accepts *either* an uploaded file *or* text input (Job Title + Company + Description) to activate the submit button.
* **Logic:** `const isFormValid = selectedFile !== null || (jobTitle !== "" && companyName !== "" && jobDescription !== "");`

### 6. Framer Motion Animations (Upload & Delete)
* **Concept:** Created highly dynamic, multi-step sequence animations.
* **`AnimatePresence`:** Used to allow components to animate *out* before being removed from the DOM.
* **Keyframes:** Used arrays in the `animate` prop (e.g., `x: [0, 80, 0]`) to create complex movement paths like arcs.
* **Timing Control:** Used `transition: { times: [...] }` to perfectly sync different properties (scale, opacity, rotation) at specific points in the animation lifecycle.
* **Callback Management:** Used `onAnimationComplete` props to tell the parent component (the form) that the animation finished, allowing the UI to smoothly transition to the next state (e.g., swapping the animation for a "Scanning" GIF).