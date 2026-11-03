import { Routes, Route } from "react-router";
import DefaultLayout from "@/layouts/DefaultLayout";
import AuthLayout from "@/layouts/AuthLayout";
import EmbedLayout from "@/layouts/EmbedLayout";

import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";

import HomePage from "@/pages/Home/HomePage";
import SearchPage from "@/pages/Search/SearchPage";
import ActivityPage from "@/pages/Activity/ActivityPage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import PostDetailPage from "@/pages/PostDetail/PostDetailPage";

import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";
import VerifyEmail from "@/pages/Auth/VerifyEmail";

import EmbedPage from "@/pages/Embed/EmbedPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes wrapped in GuestRoute and AuthLayout */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
      </Route>

      {/* Main app routes wrapped in DefaultLayout */}
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/:username/post/:postId" element={<PostDetailPage />} />
        {/* Protected routes wrapped in ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        {/* Dynamic user profile route (matches /@username and /username) */}
        <Route path="/:username" element={<ProfilePage />} />
      </Route>

      {/* Embed route with EmbedLayout */}
      <Route element={<EmbedLayout />}>
        <Route path="/:username/post/:postId/embed" element={<EmbedPage />} />
        <Route path="/posts/:postId/embed" element={<EmbedPage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
