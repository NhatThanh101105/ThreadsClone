import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onConfirm,
  isUpdating = false,
}) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (post) {
      setContent(post.content || "");
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || isUpdating) return;
    onConfirm(content.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-2xl relative animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <h3 className="font-bold text-sm text-[var(--foreground)]">
            Chỉnh sửa bài viết
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            placeholder="Nội dung bài viết..."
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isUpdating}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              {isUpdating && <Loader2 size={14} className="animate-spin" />}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

