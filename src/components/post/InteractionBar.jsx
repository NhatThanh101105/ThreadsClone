import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Quote,
  Copy,
  Image as ImageIcon,
  Code,
} from "lucide-react";

export default function InteractionBar({
  post,
  onLikeToggle,
  onOpenReply,
  onOpenQuote,
  onRepostToggle,
  onCopyLink,
  onCopyAsImage,
  onOpenEmbed,
}) {
  const { t } = useTranslation();

  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const repostRef = useRef(null);
  const shareRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (repostRef.current && !repostRef.current.contains(event.target)) {
        setShowRepostMenu(false);
      }
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLiked = Boolean(post.is_liked);
  const isReposted = Boolean(post.is_reposted);

  const likesCount = post.likes_count || 0;
  const repliesCount = post.replies_count || 0;
  const repostsCount = post.reposts_and_quotes_count || 0;

  return (
    <div className="flex items-center gap-1 sm:gap-2 pt-2 -ml-2 text-[var(--muted-foreground)]">
      {/* 1. Like Button */}
      <button
        type="button"
        onClick={() => onLikeToggle && onLikeToggle(post.id)}
        title={t("post.like")}
        aria-label={t("post.like")}
        className={`flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--accent)] transition-colors cursor-pointer group ${
          isLiked ? "text-rose-500 font-medium" : "hover:text-[var(--foreground)]"
        }`}
      >
        <Heart
          size={19}
          className={`transition-transform active:scale-125 ${
            isLiked ? "fill-current text-rose-500" : "group-hover:scale-105"
          }`}
        />
        {likesCount > 0 && (
          <span className="text-xs select-none">{likesCount}</span>
        )}
      </button>

      {/* 2. Comment / Reply Button */}
      <button
        type="button"
        onClick={() => onOpenReply && onOpenReply(post)}
        title={t("post.comment")}
        aria-label={t("post.comment")}
        className="flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors cursor-pointer group"
      >
        <MessageCircle size={19} className="group-hover:scale-105" />
        {repliesCount > 0 && (
          <span className="text-xs select-none">{repliesCount}</span>
        )}
      </button>

      {/* 3. Repost Button & Menu */}
      <div className="relative" ref={repostRef}>
        <button
          type="button"
          onClick={() => setShowRepostMenu(!showRepostMenu)}
          title={t("post.repost")}
          aria-label={t("post.repost")}
          className={`flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--accent)] transition-colors cursor-pointer group ${
            isReposted
              ? "text-emerald-500 font-medium"
              : "hover:text-[var(--foreground)]"
          }`}
        >
          <Repeat2
            size={19}
            className={`transition-transform ${
              isReposted ? "text-emerald-500 font-bold" : "group-hover:scale-105"
            }`}
          />
          {repostsCount > 0 && (
            <span className="text-xs select-none">{repostsCount}</span>
          )}
        </button>

        {/* Repost Dropdown Menu */}
        {showRepostMenu && (
          <div className="absolute left-0 bottom-full mb-1.5 z-30 w-40 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <button
              type="button"
              onClick={() => {
                setShowRepostMenu(false);
                if (onRepostToggle) onRepostToggle(post.id);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Repeat2 size={16} />
              <span>{isReposted ? "Undo Repost" : t("post.repost")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRepostMenu(false);
                if (onOpenQuote) onOpenQuote(post);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Quote size={16} />
              <span>{t("post.quote")}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Share Button & Menu */}
      <div className="relative" ref={shareRef}>
        <button
          type="button"
          onClick={() => setShowShareMenu(!showShareMenu)}
          title={t("post.share")}
          aria-label={t("post.share")}
          className="flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors cursor-pointer group"
        >
          <Send size={18} className="group-hover:scale-105" />
        </button>

        {/* Share Dropdown Menu */}
        {showShareMenu && (
          <div className="absolute left-0 bottom-full mb-1.5 z-30 w-48 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <button
              type="button"
              onClick={() => {
                setShowShareMenu(false);
                if (onCopyLink) onCopyLink(post);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Copy size={15} />
              <span>{t("post.copyLink")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowShareMenu(false);
                if (onCopyAsImage) onCopyAsImage(post);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <ImageIcon size={15} />
              <span>{t("post.copyAsImage")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowShareMenu(false);
                if (onOpenEmbed) onOpenEmbed(post);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Code size={15} />
              <span>{t("post.getEmbedCode")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
