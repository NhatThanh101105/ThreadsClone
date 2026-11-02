import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Image, Ghost } from "lucide-react";

export default function CreatePostBox({ onOpenCreateModal }) {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (onOpenCreateModal) {
      onOpenCreateModal();
    }
  };

  const username = currentUser?.username || "you";

  return (
    <div
      onClick={handleClick}
      className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)]/30 transition-all cursor-pointer mb-4 shadow-2xs"
    >
      <div className="flex items-center gap-3">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-xs text-[var(--foreground)] overflow-hidden shrink-0 border border-[var(--border)]">
          {currentUser?.avatar_url || currentUser?.avatar ? (
            <img
              src={currentUser.avatar_url || currentUser.avatar}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            (username[0] || "U").toUpperCase()
          )}
        </div>

        {/* Placeholder input */}
        <div className="flex-1 text-sm text-[var(--muted-foreground)] select-none">
          {isAuthenticated ? "Có gì mới? Bắt đầu chuỗi bài viết..." : "Đăng nhập để bắt đầu bài viết..."}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
          <button
            type="button"
            className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            title="Hình ảnh"
          >
            <Image size={18} />
          </button>
          <span
            className="px-2 py-0.5 text-[10px] font-bold rounded-md border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
            title="GIPHY GIF"
          >
            GIF
          </span>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            title="Chế độ ẩn danh"
          >
            <Ghost size={18} />
          </button>
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] ml-1">
            Đăng
          </span>
        </div>
      </div>
    </div>
  );
}
