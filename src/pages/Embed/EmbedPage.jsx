import { useParams } from "react-router";
import { CheckCircle2, Heart, MessageCircle, ExternalLink, AlertCircle } from "lucide-react";
import ThreadsLogo from "@/components/common/ThreadsLogo";
import { usePostDetail } from "@/hooks/usePosts";
import { formatRelativeTime, formatFullDateTime } from "@/lib/dateUtils";

export default function EmbedPage() {
  const { username, postId } = useParams();
  const { data: postResponse, isLoading, isError } = usePostDetail(postId);

  const post = postResponse?.data || postResponse;
  const author = post?.user || {};
  const authorUsername = author.username || username || "user";
  const authorName = author.name || authorUsername;
  const targetPostUrl = `/@${authorUsername}/post/${postId}`;

  // ── Loading Skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full max-w-lg p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--muted)]" />
            <div className="space-y-1.5">
              <div className="w-24 h-3.5 bg-[var(--muted)] rounded" />
              <div className="w-16 h-3 bg-[var(--muted)] rounded" />
            </div>
          </div>
          <ThreadsLogo size={24} className="text-[var(--muted-foreground)] opacity-50" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-[var(--muted)] rounded" />
          <div className="w-4/5 h-3.5 bg-[var(--muted)] rounded" />
        </div>
        <div className="h-44 w-full bg-[var(--muted)] rounded-xl" />
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (isError || !post) {
    return (
      <div className="w-full max-w-lg p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs text-center space-y-3">
        <div className="flex justify-center mb-2">
          <ThreadsLogo size={28} className="text-[var(--foreground)]" />
        </div>
        <div className="flex items-center justify-center gap-2 text-rose-500 font-semibold text-sm">
          <AlertCircle size={18} />
          <span>Bài viết này không khả dụng</span>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Bài viết có thể đã bị xóa hoặc tài khoản tác giả đã chuyển sang chế độ riêng tư.
        </p>
        <div className="pt-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)] hover:underline"
          >
            <span>Mở Threads</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    );
  }

  // ── Render Embed Card ──────────────────────────────────────────────────────
  return (
    <article className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <a
          href={targetPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group min-w-0"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-sm text-[var(--foreground)] overflow-hidden shrink-0 border border-[var(--border)] group-hover:opacity-90 transition-opacity">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={authorUsername}
                className="w-full h-full object-cover"
              />
            ) : (
              (authorUsername[0] || "U").toUpperCase()
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[var(--foreground)] group-hover:underline truncate">
                {authorName}
              </span>
              {author.verified && (
                <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/20 shrink-0" />
              )}
            </div>
            <span className="text-xs text-[var(--muted-foreground)] truncate">
              @{authorUsername}
            </span>
          </div>
        </a>

        {/* Threads Logo linking to post */}
        <a
          href={targetPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Xem trên Threads"
          aria-label="Xem trên Threads"
          className="p-1.5 rounded-full hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors shrink-0"
        >
          <ThreadsLogo size={24} />
        </a>
      </div>

      {/* 2. Content */}
      <div className="text-[15px] leading-relaxed text-[var(--foreground)] whitespace-pre-line break-words my-2.5">
        {post.content}
      </div>

      {/* 3. Media Preview */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="my-3 rounded-xl overflow-hidden border border-[var(--border)] bg-black/5 dark:bg-white/5">
          {post.media_urls.length === 1 ? (
            <img
              src={post.media_urls[0]}
              alt="Post media"
              className="w-full max-h-[380px] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid grid-cols-2 gap-1.5 p-1">
              {post.media_urls.slice(0, 4).map((url, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-black/10">
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Quoted Post Preview if any */}
      {post.is_quote && post.original_post && (
        <div className="my-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">
              @{post.original_post.user?.username || "user"}
            </span>
            <span>• {formatRelativeTime(post.original_post.created_at)}</span>
          </div>
          <p className="text-[var(--foreground)] line-clamp-3">
            {post.original_post.content}
          </p>
        </div>
      )}

      {/* 5. Date & Time */}
      <div className="pt-2 text-xs text-[var(--muted-foreground)]">
        {formatFullDateTime(post.created_at)}
      </div>

      {/* 6. Footer: Stats & "Xem trên Threads" Button */}
      <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Heart size={15} />
            <strong>{post.likes_count || 0}</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={15} />
            <strong>{post.replies_count || 0}</strong>
          </span>
        </div>

        <a
          href={targetPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
        >
          <span>Xem trên Threads</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
}

