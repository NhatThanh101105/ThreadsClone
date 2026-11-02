# Threads Web Clone 🧵

A feature-rich, high-performance web clone of Meta's **Threads**, built with **React 19**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit**, and **TanStack React Query**.

---

## ✨ Features

### 🔐 Authentication & Session
- **Account Registration & Login:** Form validation with React Hook Form and Zod.
- **Silent Token Refresh:** Custom Axios request/response interceptors handle JWT auto-refresh and session restoration seamlessly without disrupting user interactions.
- **Password Reset & Email Verification:** Complete flow for forgotten password requests and email token verification.

### 📱 Feed & Timeline
- **For You & Following Feeds:** Infinite scrolling powered by Intersection Observer and TanStack React Query pagination.
- **Ghost Mode Feed:** Filter and view anonymous threads.
- **Optimistic Interactions:** Instant UI feedback for likes, saves, and reposts.

### ✍️ Post Creation & Rich Media
- **Standard & Ghost Threads:** Post publicly or anonymously.
- **Direct Image & Video Upload:** Instant local preview with client-side blob generation; uploads binary files directly via `multipart/form-data` to ensure server compatibility.
- **GIPHY GIF Integration:** Built-in interactive GIPHY picker supporting real-time keyword search, categorized trending collections, and direct GIF link embeds.

### 💬 Social Interactions
- **Nested Replies:** Multi-level thread replies with quick-reply inline boxes.
- **Quote & Repost:** Repost directly or quote with added text, images, or GIFs.
- **Share Options:** Instant thread URL copying and HTML-to-Image card export.

### 🔔 Activity & Notifications
- **Categorized Activity Feed:** Filter by All, Follows, Replies, Likes, Reposts, Quotes, and Verified interactions.
- **Real-time & Optimistic Follows:** Direct "Follow Back" / "Following" toggles connected with the backend API.
- **Live User Thread Events:** Surfaces interactions and engagement metrics on the user's threads.

### 👤 Profile Management
- **Customizable Profiles:** Update display name, bio, and private account status.
- **Avatar Upload:** Direct multipart file upload with preview and instant profile synchronization.
- **Profile Tabs:** Filter user history by Threads, Replies, and Reposts.
- **Public Profiles:** Access any user via `/@username` routes.

### 🔍 Search & Exploration
- **Debounced Search:** Real-time query debouncing (500ms) for finding accounts and thread content.

### 🎨 Theming & Internationalization
- **Dark / Light Mode:** Automatic system preference detection with manual toggle persisted in `localStorage`.
- **Multilingual Support:** Seamless switching between Vietnamese and English powered by `i18next`.

---

## 🛠️ Tech Stack

- **Framework:** React 19, Vite 8
- **Routing:** React Router v8
- **State Management:** Redux Toolkit
- **Data Fetching:** TanStack React Query v5
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **HTTP Client:** Axios (Custom JWT Interceptors & FormData boundary management)
- **Forms & Validation:** React Hook Form, Zod
- **Notifications:** Sonner Toasts
- **Utilities:** `html-to-image`, `copy-to-clipboard`, `i18next`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NhatThanh101105/ThreadsClone.git
   cd ThreadsClone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=https://threads.f8team.dev
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment on Vercel

The repository includes a [vercel.json](vercel.json) file preconfigured for Single Page Application (SPA) client-side routing.

1. Import this repository into [Vercel](https://vercel.com).
2. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://threads.f8team.dev`
4. Click **Deploy**.

---

## 📄 License

This project is created for educational and portfolio demonstration purposes. All visual identity rights belong to Meta Platforms, Inc.
