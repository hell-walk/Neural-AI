# 🏗️ AI Resume Analyzer - Project Architecture & Code Guide

Welcome! This guide explains exactly how your app is structured, where everything lives, and how you can safely add new features on your own without breaking anything.

---

## 1. 📂 The Folder Structure
Your application uses **React** with the **Remix/React Router (v7)** framework. All the code you care about lives inside the `app/` folder.

```text
C:/Users/Asus/WebstormProjects/ai_resume_analyzer/app/
│
├── components/          <-- Reusable UI pieces (Buttons, Animations, Navbar)
├── lib/                 <-- Logic, APIs, and State Management (Puter, PDF parsing)
├── routes/              <-- The actual pages of your website (/home, /auth, /upload)
├── styles/              <-- Custom CSS files
│
├── root.tsx             <-- The main HTML wrapper for your entire app
└── routes.ts            <-- Where the URLs (routes) are defined
```

---

## 2. 🛣️ The `routes/` Folder (Your Pages)
If you want to edit a specific page on the website, look here. 
*Each file here represents a URL in your browser.*

* **`auth.tsx`** (The `/auth` page)
  * Handles the login UI.
  * *How it works:* Listens to `auth.isAuthenticated` from Puter. If true, it automatically redirects the user to the `/home` page (or the URL they came from).
* **`home.tsx`** (The `/home` or `/` page)
  * The main dashboard showing saved resumes.
  * Contains the "Demo Mode" logic overlay.
* **`upload.tsx`** (The `/upload` page)
  * The massive form where users provide Job Title, Company, Description, and upload their PDF.
  * This is a "Smart Form" that coordinates the UI animations and the PDF parsing.
* **`fileUploader.tsx`** (Inside `/upload` logic)
  * Specifically handles the Drag-and-Drop box using `react-dropzone`.

---

## 3. 🧩 The `components/` Folder (Reusable UI)
If you build a cool button, a cool animation, or a popup that you want to use on *multiple* pages, put it here.

* **`navbar.tsx`**: The top navigation bar. It dynamically shows/hides the "Upload" button and "Log Out" button depending on the user's state.
* **`ClearTextButton.tsx`**: The small red "X Clear All" button used on the Upload page.
* **`ResumeAnalyzerAnimation.tsx`**: The Framer Motion animation of the paper flying into the folder.
* **`DeleteFileAnimation.tsx`**: The Framer Motion animation of the paper flying into the red dustbin.

> **💡 Rule of Thumb:** If a chunk of UI code gets too big (like a 100-line animation), cut it out of the `routes/` page, paste it into a new file in `components/`, and just `import` it!

---

## 4. 🧠 The `lib/` Folder (The Brains / Logic)
This is where the complex JavaScript logic lives. It doesn't handle UI; it handles data.

### `puter.ts` (Global State & Backend)
This file uses **Zustand** to create a "Global Store" (`usePuterStore`).
* **Why it exists:** Normally, in React, passing data (like "is the user logged in?") between different pages is difficult. Zustand creates a global variable box that any page can reach into.
* **What it does:** It connects directly to `window.puter` and gives you easy hooks like `auth.signIn()`, `auth.signOut()`, and `ai.chat()`.
* **How to use it on any page:**
  ```javascript
  import { usePuterStore } from "~/lib/puter";
  
  const MyComponent = () => {
      const { auth, ai } = usePuterStore();
      
      // Now you can do auth.signIn() or ai.chat() anywhere!
  }
  ```

### `pdfUtils.ts` (PDF Processing)
This file handles the heavy lifting of reading PDFs using the `pdfjs-dist` library.
* **Why it's separated:** Reading PDFs is hard and requires huge libraries. We keep it isolated here so it doesn't slow down the rest of the app.
* **Note on SSR:** Because Remix runs on a Node.js server first, we have to use `await import('pdfjs-dist')` dynamically *inside* the functions, or else it crashes the server.

---

## 5. 🚀 How to Add New Features (A Cheat Sheet)

If you want to add a feature, follow this flow:

**Scenario A: "I want to add a new page (e.g., `/settings`)"**
1. Create a new file `app/routes/settings.tsx`.
2. Build a standard React component (`export default function Settings() { ... }`).
3. Update `app/routes.ts` to map the URL `/settings` to your new file.

**Scenario B: "I want to ask the AI a question"**
1. Open the file where the user clicks the button (e.g., `app/routes/upload.tsx`).
2. Make sure you have `const { ai } = usePuterStore();` at the top of the component.
3. Write an `async` function triggered by a button click:
   ```javascript
   const askAI = async () => {
       const response = await ai.chat("Analyze this resume: " + extractedText);
       console.log(response); // Do something with the response!
   }
   ```

**Scenario C: "I want to save a resume to the database"**
1. Use Puter's Key-Value store!
2. Get `kv` from the store: `const { kv } = usePuterStore();`
3. Save data: `await kv.set('resume_123', JSON.stringify(myResumeData));`

---

## 6. 🛠️ Important Rules When Coding in this Project

1. **Client-Side vs Server-Side:** Remix renders code on the server first. If you use `window`, `document`, or `localStorage` directly in the main body of a component, it will crash! Always wrap browser-specific code inside a `useEffect` hook, because `useEffect` only runs in the browser.
2. **Typescript Warnings:** If TypeScript puts a red underline under something, hover over it. Often, you just need to add a type definition (e.g., changing `file` to `file: File`).
3. **Adding Images/GIFs:** Put them in `public/images/`. In your code, reference them simply as `/images/my-image.png`. Do NOT write `public/images/`.