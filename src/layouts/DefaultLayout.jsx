import { useState } from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  LogOut,
} from "lucide-react";
import ThreadsLogo from "@/components/common/ThreadsLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
import LoginPanel from "@/components/common/LoginPanel";
import CreatePostModal from "@/components/modal/CreatePostModal";
import { useCreatePost } from "@/hooks/usePosts";
import { logoutUser } from "@/store/slices/authSlice";

export default function DefaultLayout() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createMutation = useCreatePost();

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsCreateOpen(true);
  };

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/search", icon: Search, label: t("nav.search") },
    { to: "#create", icon: PlusSquare, label: t("nav.create"), isAction: true },
    { to: "/activity", icon: Heart, label: t("nav.activity") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--background)]/85 backdrop-blur-md border-b border-[var(--border)]">
        <Link to="/" aria-label="Threads Home">
          <ThreadsLogo size={32} />
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              title={t("nav.logout")}
              aria-label={t("nav.logout")}
              className="p-2 rounded-full hover:bg-[var(--accent)] text-rose-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Desktop Left Sidebar (Icons only as required) */}
      <aside className="hidden md:flex flex-col justify-between items-center w-20 lg:w-24 h-screen sticky top-0 py-6 border-r border-[var(--border)] shrink-0">
        <div className="flex flex-col items-center gap-8 w-full">
          <Link to="/" className="p-2 hover:opacity-80 transition-opacity" aria-label="Threads">
            <ThreadsLogo size={36} />
          </Link>

          <nav className="flex flex-col items-center gap-4 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : !item.isAction && location.pathname.startsWith(item.to);

              if (item.isAction) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={handleOpenCreate}
                    title={item.label}
                    aria-label={item.label}
                    className="p-3.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all cursor-pointer"
                  >
                    <Icon size={26} />
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  aria-label={item.label}
                  className={({ isActive: navActive }) =>
                    `p-3.5 rounded-xl transition-all ${
                      navActive || isActive
                        ? "text-[var(--foreground)] bg-[var(--accent)] font-bold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                    }`
                  }
                >
                  <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls on desktop sidebar */}
        <div className="flex flex-col items-center gap-3 w-full">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              type="button"
              title={t("nav.logout")}
              aria-label={t("nav.logout")}
              className="p-2.5 rounded-full hover:bg-[var(--accent)] text-rose-500 transition-colors cursor-pointer"
            >
              <LogOut size={20} />
            </button>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex justify-center w-full min-w-0">
        {/* Center Feed / Content column */}
        <main className="w-full max-w-[640px] min-h-[calc(100vh-60px)] md:min-h-screen px-3 sm:px-4 py-4 md:py-6 border-x-0 md:border-x border-[var(--border)]">
          <Outlet />
        </main>

        {/* Right Sidebar: LoginPanel if not logged in, or User summary if logged in */}
        <aside className="hidden xl:block w-80 p-6 sticky top-0 h-screen shrink-0 overflow-y-auto">
          {!isAuthenticated ? (
            <LoginPanel />
          ) : (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-85 transition-opacity"
                title="Xem trang cá nhân"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-sm text-[var(--foreground)] overflow-hidden border border-[var(--border)] shrink-0">
                  {currentUser?.avatar_url || currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar_url || currentUser.avatar}
                      alt={currentUser.name || currentUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (currentUser?.name?.[0] || currentUser?.username?.[0] || "U").toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[var(--foreground)] truncate">
                    {currentUser?.name || currentUser?.username}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    @{currentUser?.username}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                type="button"
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] text-rose-500 transition-colors cursor-pointer"
              >
                {t("nav.logout")}
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Bottom Navigation Bar (Icons only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2.5 bg-[var(--background)]/90 backdrop-blur-md border-t border-[var(--border)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : !item.isAction && location.pathname.startsWith(item.to);

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={handleOpenCreate}
                title={item.label}
                aria-label={item.label}
                className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <Icon size={24} />
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive: navActive }) =>
                `p-2 transition-colors ${
                  navActive || isActive
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
                }`
              }
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </NavLink>
          );
        })}
      </nav>

      {/* Global Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmitPost={(postData) => createMutation.mutate(postData)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
