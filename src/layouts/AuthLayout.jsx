import { Outlet, Link } from "react-router";
import ThreadsLogo from "@/components/common/ThreadsLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--foreground)] px-4">
      {/* Top Bar with theme & language toggle */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4">
        <Link to="/" className="hover:opacity-80 transition-opacity" aria-label="Home">
          <ThreadsLogo size={36} />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-6 text-center text-xs text-[var(--muted-foreground)]">
        <p>© {new Date().getFullYear()} Threads Clone. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
}
