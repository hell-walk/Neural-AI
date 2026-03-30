# 🧠 Neural-AI Resume Suite

A modern, full-stack web application designed to help users analyze, score, build, and improve their resumes using AI. Built with React, Remix, and Google's Gemini API, this project features a beautiful, highly interactive frontend with complex animations and robust state management.

This project was a collaborative effort, and we are proud to have built a fully functional and polished application that meets all the initial requirements.

---

## 🚀 Live Demo & Features

### Core Functionality
*   **AI-Powered Resume Analysis**: Upload your resume (PDF) along with your dream job title and company to get a tailored ATS score and actionable improvement tips from Google's Gemini API.
*   **Interactive Resume Builder**: Create a professional resume from scratch using a guided form. The builder uses AI to help you craft the perfect resume.
*   **Dynamic Dashboard**: View a history of all your analyzed and built resumes in a clean, table-based layout.
*   **Demo Mode**: Allows guests to explore the application interface and see placeholder data without needing to create an account.
*   **Data Wiping**: A utility to clear all your data from the application.

### Advanced UI/UX
*   **Drag-and-Drop Uploads**: A robust file uploader built with `react-dropzone`, featuring strict file type (.pdf) and size (10MB) validation.
*   **Framer Motion Animations**:
    *   **Upload Sequence**: A multi-step keyframe animation of a paper arcing smoothly into a folder.
    *   **Delete Sequence**: A playful animation where the document spins and shrinks into a shaking dustbin.
*   **Polished Aesthetics**: Custom Tailwind CSS styling featuring glassmorphism (backdrop blurs), smooth gradients, and interactive states.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: React 19 + Remix (Vite)
*   **AI**: Google Gemini API
*   **Styling**: Tailwind CSS v4 + Custom CSS modules
*   **State Management**: Zustand (Global Store)
*   **Animations**: Framer Motion + `react-type-animation`
*   **Backend & Authentication**: Puter.js (Puter SDK)
*   **Language**: TypeScript

---

## 🏗️ Architecture & Code Guide

### 1. Authentication System (`Puter.js`)
*   **Global Store**: Built a custom global store using Zustand (`app/lib/puter.ts`) that initializes the Puter SDK and manages global user state (`user`, `isAuthenticated`, `isLoading`).
*   **Performance Optimizations**: Implemented a global `isPuterInitializing` flag to prevent React Strict Mode from spamming the `setInterval` initialization loop, drastically improving app load times and preventing memory leaks.
*   **Safe Routing**: Built custom navigation guards to automatically route unauthenticated users to the `/auth` page while preserving their intended destination via URL parameters (`?next=/upload`).

### 2. Form & State Management (`upload.tsx` and `builder.tsx`)
*   **Real-time Validation**: The upload and builder forms use controlled React components (`useState`) to track all user input.
*   **Dynamic Submit Button**: The "Analyze Resume" and "Generate Resume" buttons remain disabled until the user provides all necessary context, preventing incomplete API calls.
*   **Smart Reset**: A custom `<ClearTextButton />` component conditionally appears only when data is entered, allowing users to wipe the form state instantly.

### 3. Advanced File Uploading (`FileUploader.tsx`)
*   **Component Extraction**: Complex drag-and-drop logic is isolated into a dedicated component to keep the main pages clean.
*   **Validation & Error Handling**: Uses `FileRejection` to catch specific error codes (`too-many-files`, `file-too-large`, `file-invalid-type`) and display targeted `alert()` messages to the user.
*   **Utility Formatting**: Wrote a mathematical `formatSize` utility (`app/lib/utility.ts`) to convert raw byte numbers into human-readable strings (KB, MB) for the UI.

### 4. Animation Orchestration
*   **Concept**: Created highly dynamic, multi-step sequence animations without relying on GIFs.
*   **`AnimatePresence`**: Used to allow components to animate *out* before being completely removed from the React DOM.
*   **Keyframes & Timing**: Used arrays in the `animate` prop (e.g., `x: [0, 80, 0]`) to create complex movement paths, controlled precisely by `transition: { times: [...] }` to sync scale, opacity, and rotation.

---

## 💻 Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/ai-resume-analyzer.git
    cd ai-resume-analyzer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root of the project and add your Gemini API key:
    ```
    VITE_GEMINI_API_KEY=your_api_key
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Navigate to `http://localhost:5173`

---

## 📁 Key File Structure

```text
app/
├── components/          # Reusable UI (Navbar, Animations, FileUploader)
├── lib/                 # Core Logic (Puter.js store, Utility functions)
├── routes/              # Page Routes (/home, /auth, /upload, /resume/:id, /builder, /wipe)
├── styles/              # Custom CSS (auth.css)
├── root.tsx             # Main application wrapper
└── routes.ts            # Route definitions
```

---

## 🔮 Project Complete

We have successfully built a rock-solid, scalable foundation that meets all the initial requirements. This project is now complete.
```