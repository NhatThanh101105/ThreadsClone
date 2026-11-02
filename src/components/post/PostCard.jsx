import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  MoreHorizontal,
  Bookmark,
  BookmarkCheck,
  EyeOff,
  VolumeX,
  ShieldAlert,
  UserX,
  Flag,
  Copy,
  Edit3,
  Trash2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import InteractionBar from "@/components/post/InteractionBar";
import { formatRelativeTime } from "@/lib/dateUtils";

export default function PostCard({
  post,
  onLikeToggle,
  onOpenReply,
  onOpenQuote,
  onRepostToggle,
  onSaveToggle,
  onFollowToggle,
  onOpenEditModal,
  onHidePost,
  onMuteUser,
  onRestrictUser,
  onOpenBlockModal,
  onOpenReportModal,
  onOpenDeleteModal,
  onOpenEmbedModal,
  onCopyLink,
  onCopyAsImage,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const cardRef = useRef(null);

  const handleCardClick = (e) => {
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest(".no-card-click")
    ) {
      return;
    }
    const targetUsername = post?.user?.username || "user";
    navigate(`/@${targetUsername}/post/${post.id}`);
  };

  // Close 3-dot menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!post) return null;

  const author = post.user || {};
  const isOwner = currentUser && (currentUser.id === post.user_id || currentUser.username === author.username);
  const isSaved = Boolean(post.is_saved);
  const timeFormatted = formatRelativeTime(post.created_at);

  const renderMedia = (mediaUrls) => {
    if (!mediaUrls || mediaUrls.length === 0) return null;

    if (mediaUrls.length === 1) {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden border border-[var(--border)] max-h-[460px] bg-black/5 dark:bg-white/5">
          <img
            src={mediaUrls[0]}
            alt="Post attachment"
            className="w-full h-full object-cover max-h-[460px]"
            loading="lazy"
          />
        </div>
      );
    }

    return (
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border border-[var(--border)] p-1 bg-black/5 dark:bg-white/5">
        {mediaUrls.slice(0, 4).map((url, idx) => (
          <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-black/10">
            <img
              src={url}
              alt={`Attachment ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderQuotedPost = (originalPost) => {
    if (!originalPost) return null;
    const originalAuthor = originalPost.user || {};

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          const targetUsername = originalAuthor.username || "user";
          navigate(`/@${targetUsername}/post/${originalPost.id}`);
        }}
        className="mt-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-[10px] text-[var(--foreground)] overflow-hidden shrink-0">
            {originalAuthor.avatar_url ? (
              <img
                src={originalAuthor.avatar_url}
                alt={originalAuthor.username || "user"}
                className="w-full h-full object-cover"
              />
            ) : (
              (originalAuthor.username?.[0] || originalAuthor.name?.[0] || "U").toUpperCase()
            )}
          </div>
          <span className="font-semibold text-xs text-[var(--foreground)]">
            {originalAuthor.username || originalAuthor.name}
          </span>
          {originalAuthor.verified && (
            <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/20" />
          )}
          <span className="text-[11px] text-[var(--muted-foreground)]">
            • {formatRelativeTime(originalPost.created_at)}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--foreground)]/90 leading-relaxed whitespace-pre-line">
          {originalPost.content}
        </p>

        {renderMedia(originalPost.media_urls)}
      </div>
    );
  };

  return (
    <article
      ref={cardRef}
      onClick={handleCardClick}
      className="py-4 border-b border-[var(--border)] transition-colors hover:bg-[var(--accent)]/15 -mx-3 sm:-mx-4 px-3 sm:px-4 cursor-pointer"
    >
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="flex flex-col items-center shrink-0 relative">
          <Link
            to={`/@${author.username || "user"}`}
            className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-sm text-[var(--foreground)] overflow-hidden hover:opacity-90 transition-opacity border border-[var(--border)]"
          >
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.username || "avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              (author.username?.[0] || author.name?.[0] || "U").toUpperCase()
            )}
          </Link>

          {/* Follow '+' Badge */}
          {!isOwner && onFollowToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle(author.id);
              }}
              title={`Theo dõi @${author.username || author.name}`}
              aria-label={`Theo dõi @${author.username || author.name}`}
              className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center border-2 border-[var(--card)] hover:scale-110 active:scale-95 transition-transform shadow-xs cursor-pointer z-10"
            >
              <Plus size={11} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Post Main Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Username, verified, time, 3-dots */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                to={`/@${author.username || "user"}`}
                className="font-bold text-sm text-[var(--foreground)] hover:underline truncate"
              >
                {author.username || author.name}
              </Link>
              {author.verified && (
                <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/20 shrink-0" />
              )}
              {post.is_ghost && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  Ghost
                </span>
              )}
              <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                • {timeFormatted}
              </span>
            </div>

            {/* 3-dot Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                title="More options"
                aria-label="More options"
                className="p-1.5 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
              >
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 z-30 w-52 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {/* Save / Unsave */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      if (onSaveToggle) onSaveToggle(post.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    <span>{isSaved ? t("post.unsave") : t("post.save")}</span>
                  </button>

                  {/* Not interested / Hide */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      if (onHidePost) onHidePost(post.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    <EyeOff size={16} />
                    <span>{t("post.notInterested")}</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      if (onCopyLink) onCopyLink(post);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    <Copy size={16} />
                    <span>{t("post.copyLink")}</span>
                  </button>

                  <div className="h-px bg-[var(--border)] my-1" />

                  {/* Options for other users' posts */}
                  {!isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onMuteUser) onMuteUser(author.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        <VolumeX size={16} />
                        <span>{t("post.mute")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onRestrictUser) onRestrictUser(author.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        <ShieldAlert size={16} />
                        <span>{t("post.restrict")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onOpenBlockModal) onOpenBlockModal(author);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <UserX size={16} />
                        <span>{t("post.block")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onOpenReportModal) onOpenReportModal(post);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Flag size={16} />
                        <span>{t("post.report")}</span>
                      </button>
                    </>
                  )}

                  {/* Options for current user's posts (Edit / Delete) */}
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onOpenEditModal) onOpenEditModal(post);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        <Edit3 size={16} />
                        <span>{t("post.edit")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          if (onOpenDeleteModal) onOpenDeleteModal(post);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                        <span>{t("post.delete")}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-line break-words">
            {post.content}
          </div>

          {/* Media Attachments */}
          {renderMedia(post.media_urls)}

          {/* Quoted Post Preview */}
          {post.is_quote && renderQuotedPost(post.original_post)}

          {/* Interaction Bar */}
          <InteractionBar
            post={post}
            onLikeToggle={onLikeToggle}
            onOpenReply={onOpenReply}
            onOpenQuote={onOpenQuote}
            onRepostToggle={onRepostToggle}
            onCopyLink={onCopyLink}
            onCopyAsImage={() => onCopyAsImage && onCopyAsImage(cardRef.current, post)}
            onOpenEmbed={onOpenEmbedModal}
          />
        </div>
      </div>
    </article>
  );
}
