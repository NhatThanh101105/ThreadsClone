import { Outlet } from "react-router";

export default function EmbedLayout() {
  return (
    <div className="w-full min-h-screen bg-transparent text-[var(--foreground)] p-2 sm:p-3 flex items-center justify-center antialiased">
      <main className="w-full max-w-lg mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

