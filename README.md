# 🧠 Neural-AI Resume Analyzer

A modern, full-stack web application designed to help users analyze, score, and improve their resumes using AI. Built with React, Remix, and Puter.js, this project features a beautiful, highly interactive frontend with complex animations and robust state management.

---

## 🚀 Live Demo & Features

### Core Functionality
* **AI-Powered Analysis**: Upload your resume (PDF/Word) along with your dream job title and company to get a tailored ATS score and actionable improvement tips.
* **Dynamic Dashboard**: View a history of all your previously uploaded and scored resumes, complete with visual thumbnail previews and comprehensive breakdowns.
* **Demo Mode**: Allows guests to explore the application interface and see placeholder data without needing to create an account.

### Advanced UI/UX
* **Drag-and-Drop Uploads**: A robust file uploader built with `react-dropzone`, featuring strict file type (.pdf, .doc, .docx) and size (10MB) validation.
* **Framer Motion Animations**:
  * **Upload Sequence**: A multi-step keyframe animation of a paper arcing smoothly into a folder.
  * **Delete Sequence**: A playful animation where the document spins and shrinks into a shaking dustbin.
* **Polished Aesthetics**: Custom Tailwind CSS styling featuring glassmorphism (backdrop blurs), smooth gradients, and interactive states.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 + Remix (Vite)
* **Styling**: Tailwind CSS v4 + Custom CSS modules
* **State Management**: Zustand (Global Store)
* **Animations**: Framer Motion + `react-type-animation`
* **Backend & Authentication**: Puter.js (Puter SDK)
* **Language**: TypeScript

---

## 🏗️ Architecture & Code Guide

### 1. Authentication System (`Puter.js`)
* **Global Store**: Built a custom global store using Zustand (`app/lib/puter.ts`) that initializes the Puter SDK and manages global user state (`user`, `isAuthenticated`, `isLoading`).
* **Performance Optimizations**: Implemented a global `isPuterInitializing` flag to prevent React Strict Mode from spamming the `setInterval` initialization loop, drastically improving app load times and preventing memory leaks.
* **Safe Routing**: Built custom navigation guards to automatically route unauthenticated users to the `/auth` page while preserving their intended destination via URL parameters (`?next=/upload`).

### 2. Form & State Management (`upload.tsx`)
* **Real-time Validation**: The upload form uses controlled React components (`useState`) to track the Job Title, Company, Description, and the selected File. 
* **Dynamic Submit Button**: The "Analyze Resume" button remains disabled until the user provides all necessary context (or chooses to proceed with just a file), preventing incomplete API calls.
* **Smart Reset**: A custom `<ClearTextButton />` component conditionally appears only when data is entered, allowing users to wipe the form state instantly.

### 3. Advanced File Uploading (`FileUploader.tsx`)
* **Component Extraction**: Complex drag-and-drop logic is isolated into a dedicated component to keep the main pages clean.
* **Validation & Error Handling**: Uses `FileRejection` to catch specific error codes (`too-many-files`, `file-too-large`, `file-invalid-type`) and display targeted `alert()` messages to the user.
* **Utility Formatting**: Wrote a mathematical `formatSize` utility (`app/lib/utility.ts`) to convert raw byte numbers into human-readable strings (KB, MB) for the UI.

### 4. Animation Orchestration
* **Concept**: Created highly dynamic, multi-step sequence animations without relying on GIFs.
* **`AnimatePresence`**: Used to allow components to animate *out* before being completely removed from the React DOM.
* **Keyframes & Timing**: Used arrays in the `animate` prop (e.g., `x: [0, 80, 0]`) to create complex movement paths, controlled precisely by `transition: { times: [...] }` to sync scale, opacity, and rotation.

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-resume-analyzer.git
   cd ai-resume-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173`

---

## 📁 Key File Structure

```text
app/
├── components/          # Reusable UI (Navbar, Animations, FileUploader)
├── lib/                 # Core Logic (Puter.js store, Utility functions)
├── routes/              # Page Routes (/home, /auth, /upload, /resume/:id)
├── styles/              # Custom CSS (auth.css)
├── root.tsx             # Main application wrapper
└── routes.ts            # Route definitions
```

---

## 🔮 Future Roadmap

We have built a rock-solid, scalable foundation. Here are the planned upcoming features:

### 1. Interactive Resume Builder
* Create a new `/resumes` route featuring a comprehensive split-screen UI.
* **Left Panel**: A highly detailed, tabbed form (Personal, Experience, Education, Skills, Projects) connected to a global Zustand JSON state.
* **Right Panel**: A live PDF preview that updates instantly as the user types.

### 2. AI-Powered Inline Suggestions
* Leverage the existing `pdfUtils.ts` (which already extracts raw text from uploaded PDFs) to feed data to `puter.ai.chat()`.
* Implement a feature where the AI can auto-rewrite specific bullet points or summaries, injecting the improved text directly into the Resume Builder's state.

### 3. Backend & Database Integration
* Re-enable the backend hooks in `upload.tsx` to push uploaded PDFs and generated thumbnail PNGs to Puter's File System (`fs.upload()`).
* Save the AI's JSON feedback and the File System paths to Puter's Key-Value store (`kv.set()`) so users can access their history on the Dashboard.