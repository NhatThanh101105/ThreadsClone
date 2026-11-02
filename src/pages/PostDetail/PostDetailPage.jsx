import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import copy from "copy-to-clipboard";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  Send,
  Trash2,
  Bookmark,
  BookmarkCheck,
  UserX,
  Flag,
  Copy,
  X,
  Heart,
  MessageCircle,
  Edit3,
} from "lucide-react";

import InteractionBar from "@/components/post/InteractionBar";
import BlockConfirmModal from "@/components/modal/BlockConfirmModal";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import EditPostModal from "@/components/modal/EditPostModal";
import ReportModal from "@/components/modal/ReportModal";
import ReplyModal from "@/components/modal/ReplyModal";
import QuoteModal from "@/components/modal/QuoteModal";
import EmbedModal from "@/components/modal/EmbedModal";

import {
  usePostDetail,
  usePostReplies,
  useLikeToggle,
  useRepostToggle,
  useSaveToggle,
  useDeletePost,
  useEditPost,
  useReplyPost,
  useQuotePost,
} from "@/hooks/usePosts";
import postsApi from "@/services/posts.api";
import { formatRelativeTime, formatFullDateTime } from "@/lib/dateUtils";

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPostMenu, setShowPostMenu] = useState(false);

  // Quick reply input state
  const [replyContent, setReplyContent] = useState("");
  const [replyMediaUrls, setReplyMediaUrls] = useState([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const replyInputRef = useRef(null);
  const postCardRef = useRef(null);
  const postMenuRef = useRef(null);
  const loadMoreRepliesRef = useRef(null);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const {
    data: postResponse,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPost,
  } = usePostDetail(postId);

  const {
    data: repliesResponse,
    isLoading: isRepliesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchReplies,
  } = usePostReplies(postId);

  // Unpack post data
  const post = postResponse?.data || postResponse;

  // Unpack replies data
  const replies =
    repliesResponse?.pages?.flatMap((page) => {
      if (Array.isArray(page?.data?.data)) return page.data.data;
      if (Array.isArray(page?.data)) return page.data;
      if (Array.isArray(page)) return page;
      return [];
    }) ?? [];

  // ── Mutations ───────────────────────────────────────────────────────────────
  const likeMutation = useLikeToggle();
  const repostMutation = useRepostToggle();
  const saveMutation = useSaveToggle();
  const deleteMutation = useDeletePost();
  const editMutation = useEditPost();
  const replyMutation = useReplyPost();
  const quoteMutation = useQuotePost();

  // ── Close post menu on outside click ────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event) {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target)) {
        setShowPostMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Infinite scroll for replies ─────────────────────────────────────────────
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });
    const el = loadMoreRepliesRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [handleObserver]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLikeToggle = (targetPostId) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thích bài viết.");
      return;
    }
    const isTargetMain = post && post.id === targetPostId;
    const isLiked = isTargetMain
      ? Boolean(post.is_liked)
      : Boolean(replies.find((r) => r.id === targetPostId)?.is_liked);
    likeMutation.mutate({ postId: targetPostId, isLiked });
  };

  const handleRepostToggle = (targetPostId) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng lại bài viết.");
      return;
    }
    const isReposted = post && post.id === targetPostId ? Boolean(post.is_reposted) : false;
    repostMutation.mutate({ postId: targetPostId, isReposted });
  };

  const handleSaveToggle = (targetPostId) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu bài viết.");
      return;
    }
    const isSaved = post && post.id === targetPostId ? Boolean(post.is_saved) : false;
    saveMutation.mutate({ postId: targetPostId, isSaved });
  };

  const handleCopyLink = (p) => {
    const postObj = p || post;
    const authorUsername = postObj?.user?.username || "user";
    const shareUrl = `${window.location.origin}/@${authorUsername}/post/${postObj.id}`;
    copy(shareUrl);
    toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
  };

  const handleCopyAsImage = async (cardEl) => {
    const targetEl = cardEl || postCardRef.current;
    if (!targetEl) return;
    try {
      const dataUrl = await toPng(targetEl, { cacheBust: true, pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Đã sao chép hình ảnh bài viết!");
    } catch (_err) {
      toast.error("Không thể sao chép hình ảnh bài viết.");
    }
  };

  // Upload inline media
  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingMedia(true);
      const res = await postsApi.uploadMedia(file);
      const uploadedUrl =
        res?.data?.urls?.[0] ||
        res?.data?.url ||
        res?.url ||
        (Array.isArray(res?.data) ? res.data[0] : null);

      if (uploadedUrl) {
        setReplyMediaUrls((prev) => [...prev, uploadedUrl]);
        toast.success("Đã tải ảnh lên thành công!");
      } else {
        toast.error("Không nhận được URL ảnh từ máy chủ.");
      }
    } catch (_err) {
      toast.error("Tải ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Submit quick inline reply
  const handleQuickReplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để trả lời.");
      navigate("/login");
      return;
    }

    if (!replyContent.trim() && replyMediaUrls.length === 0) return;

    replyMutation.mutate(
      {
        parentPostId: post.id,
        content: replyContent.trim(),
        media_urls: replyMediaUrls,
      },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyMediaUrls([]);
          setShowEmojiPicker(false);
          refetchPost();
          refetchReplies();
        },
      }
    );
  };

  // Submit modal reply
  const handleModalReplySubmit = (formData) => {
    replyMutation.mutate(
      {
        parentPostId: selectedPost?.id || post.id,
        ...formData,
      },
      {
        onSuccess: () => {
          setActiveModal(null);
          refetchPost();
          refetchReplies();
        },
      }
    );
  };

  // Submit modal quote
  const handleModalQuoteSubmit = (formData) => {
    quoteMutation.mutate(
      {
        originalPostId: selectedPost?.id || post.id,
        ...formData,
      },
      {
        onSuccess: () => {
          setActiveModal(null);
        },
      }
    );
  };

  // Delete confirm
  const handleDeleteConfirm = () => {
    if (!selectedPost && !post) return;
    const targetId = selectedPost?.id || post.id;
    deleteMutation.mutate(
      { postId: targetId },
      {
        onSuccess: () => {
          setActiveModal(null);
          if (targetId === post.id) {
            navigate("/");
          } else {
            refetchReplies();
          }
        },
      }
    );
  };

  const author = post?.user || {};
  const isOwner =
    currentUser &&
    (currentUser.id === post?.user_id || currentUser.username === author.username);
  const isSaved = Boolean(post?.is_saved);

  // ── Render Loading State ────────────────────────────────────────────────────
  if (isPostLoading) {
    return (
      <div className="w-full max-w-xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-9 h-9 rounded-full bg-[var(--muted)] animate-pulse" />
          <div className="h-5 w-24 bg-[var(--muted)] rounded-md animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-full bg-[var(--muted)] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
              <div className="h-3 w-20 bg-[var(--muted)] rounded animate-pulse" />
            </div>
          </div>
          <div className="h-16 w-full bg-[var(--muted)] rounded-xl animate-pulse" />
          <div className="h-64 w-full bg-[var(--muted)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Render Error State ──────────────────────────────────────────────────────
  if (isPostError || !post) {
    return (
      <div className="w-full max-w-xl mx-auto py-20 text-center space-y-4">
        <p className="text-base text-[var(--muted-foreground)]">
          Bài viết này không tồn tại hoặc đã bị xóa.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Trở về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto pb-24">
      {/* ── Top Header Bar ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-3 px-1 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md -mt-4 md:-mt-6 mb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-2 -ml-2 rounded-full text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-base text-[var(--foreground)]">
            Thread
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            refetchPost();
            refetchReplies();
            toast.success("Đã làm mới dữ liệu!");
          }}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          Làm mới
        </button>
      </div>

      {/* ── Main Post View ───────────────────────────────────────────────────── */}
      <article ref={postCardRef} className="pt-2 pb-4">
        {/* Author Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/@${author.username || "user"}`}
              className="w-11 h-11 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-sm text-[var(--foreground)] overflow-hidden border border-[var(--border)] hover:opacity-90 transition-opacity"
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

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Link
                  to={`/@${author.username || "user"}`}
                  className="font-bold text-sm text-[var(--foreground)] hover:underline"
                >
                  {author.username || author.name}
                </Link>
                {author.verified && (
                  <CheckCircle2
                    size={15}
                    className="text-blue-500 fill-blue-500/20 shrink-0"
                  />
                )}
                {post.is_ghost && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Ghost
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">
                @{author.username || "user"}
              </span>
            </div>
          </div>

          {/* 3-dot dropdown menu */}
          <div className="relative" ref={postMenuRef}>
            <button
              type="button"
              onClick={() => setShowPostMenu(!showPostMenu)}
              aria-label="Options"
              className="p-2 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
            >
              <MoreHorizontal size={20} />
            </button>

            {showPostMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 w-52 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostMenu(false);
                    handleSaveToggle(post.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  <span>{isSaved ? t("post.unsave") : t("post.save")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPostMenu(false);
                    handleCopyLink(post);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <Copy size={16} />
                  <span>{t("post.copyLink")}</span>
                </button>

                <div className="h-px bg-[var(--border)] my-1" />

                {!isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        setSelectedUser(author);
                        setActiveModal("block");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <UserX size={16} />
                      <span>{t("post.block")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        setSelectedPost(post);
                        setActiveModal("report");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Flag size={16} />
                      <span>{t("post.report")}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        setSelectedPost(post);
                        setActiveModal("editPost");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      <Edit3 size={16} />
                      <span>{t("post.edit")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        setSelectedPost(post);
                        setActiveModal("delete");
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
        <p className="text-[17px] leading-relaxed text-[var(--foreground)] whitespace-pre-line break-words my-3 font-normal">
          {post.content}
        </p>

        {/* Media Attachments */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="my-3 rounded-2xl overflow-hidden border border-[var(--border)] bg-black/5 dark:bg-white/5">
            {post.media_urls.length === 1 ? (
              <img
                src={post.media_urls[0]}
                alt="Post attachment"
                className="w-full max-h-[520px] object-cover"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1.5">
                {post.media_urls.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden bg-black/10"
                  >
                    <img
                      src={url}
                      alt={`Attachment ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quoted Post Preview */}
        {post.is_quote && post.original_post && (
          <div
            onClick={() => {
              const targetUsername = post.original_post.user?.username || "user";
              navigate(`/@${targetUsername}/post/${post.original_post.id}`);
            }}
            className="my-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-[10px] text-[var(--foreground)] overflow-hidden shrink-0">
                {post.original_post.user?.avatar_url ? (
                  <img
                    src={post.original_post.user.avatar_url}
                    alt={post.original_post.user.username || "user"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (post.original_post.user?.username?.[0] || post.original_post.user?.name?.[0] || "U").toUpperCase()
                )}
              </div>
              <span className="font-semibold text-xs text-[var(--foreground)]">
                {post.original_post.user?.username || post.original_post.user?.name || "user"}
              </span>
              {post.original_post.user?.verified && (
                <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/20" />
              )}
              <span className="text-xs text-[var(--muted-foreground)]">
                • {formatRelativeTime(post.original_post.created_at)}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)] whitespace-pre-line leading-relaxed">
              {post.original_post.content}
            </p>
            {post.original_post.media_urls && post.original_post.media_urls.length > 0 && (
              <div className="mt-2.5 rounded-xl overflow-hidden border border-[var(--border)] max-h-56">
                <img
                  src={post.original_post.media_urls[0]}
                  alt="Quoted media"
                  className="w-full h-full object-cover max-h-56"
                />
              </div>
            )}
          </div>
        )}

        {/* Date and Time Details */}
        <div className="py-2.5 border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] flex items-center gap-2">
          <span>{formatFullDateTime(post.created_at)}</span>
          <span>•</span>
          <span>Threads Web App</span>
        </div>

        {/* Stats Row */}
        {(post.likes_count > 0 ||
          post.replies_count > 0 ||
          post.reposts_and_quotes_count > 0) && (
          <div className="py-3 border-b border-[var(--border)] flex items-center gap-4 text-xs sm:text-sm text-[var(--muted-foreground)]">
            {post.likes_count > 0 && (
              <span>
                <strong className="text-[var(--foreground)] font-bold">
                  {post.likes_count}
                </strong>{" "}
                lượt thích
              </span>
            )}
            {post.replies_count > 0 && (
              <span>
                <strong className="text-[var(--foreground)] font-bold">
                  {post.replies_count}
                </strong>{" "}
                câu trả lời
              </span>
            )}
            {post.reposts_and_quotes_count > 0 && (
              <span>
                <strong className="text-[var(--foreground)] font-bold">
                  {post.reposts_and_quotes_count}
                </strong>{" "}
                lượt đăng lại
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="py-1">
          <InteractionBar
            post={post}
            onLikeToggle={handleLikeToggle}
            onOpenReply={() => {
              if (replyInputRef.current) {
                replyInputRef.current.focus();
              } else {
                setSelectedPost(post);
                setActiveModal("reply");
              }
            }}
            onOpenQuote={(p) => {
              setSelectedPost(p);
              setActiveModal("quote");
            }}
            onRepostToggle={handleRepostToggle}
            onCopyLink={handleCopyLink}
            onCopyAsImage={handleCopyAsImage}
            onOpenEmbed={(p) => {
              setSelectedPost(p);
              setActiveModal("embed");
            }}
          />
        </div>
      </article>

      {/* ── Inline Quick Reply Box ───────────────────────────────────────────── */}
      <div className="border-t border-b border-[var(--border)] py-4 my-2">
        {isAuthenticated ? (
          <form onSubmit={handleQuickReplySubmit} className="flex gap-3">
            {/* User Avatar with thread line */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-xs text-[var(--foreground)] overflow-hidden border border-[var(--border)]">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (currentUser?.username?.[0] || "U").toUpperCase()
                )}
              </div>
            </div>

            {/* Input Composer */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs text-[var(--muted-foreground)]">
                  Trả lời{" "}
                  <span className="font-semibold text-[var(--foreground)]">
                    @{author.username || "user"}
                  </span>
                </span>
              </div>

              <textarea
                ref={replyInputRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Trả lời ${author.username || "tác giả"}...`}
                rows={2}
                className="w-full bg-transparent border-none outline-none resize-none text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:ring-0 p-0 leading-relaxed"
              />

              {/* Uploaded media previews */}
              {replyMediaUrls.length > 0 && (
                <div className="flex gap-2 my-2 overflow-x-auto pb-1">
                  {replyMediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)] shrink-0 bg-black/10"
                    >
                      <img
                        src={url}
                        alt="attachment"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setReplyMediaUrls((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/40 mt-2">
                <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                  {/* Media upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingMedia}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload photo"
                    className="p-1.5 rounded-full hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    {isUploadingMedia ? (
                      <Loader2 size={17} className="animate-spin text-blue-500" />
                    ) : (
                      <ImageIcon size={17} />
                    )}
                  </button>

                  {/* Quick Emoji Picker Toggle */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      aria-label="Add emoji"
                      className="p-1.5 rounded-full hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      <Smile size={17} />
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute left-0 bottom-full mb-2 p-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl flex gap-1 z-30">
                        {["❤️", "🔥", "😂", "👏", "🙌", "😍", "🎉", "💯"].map(
                          (emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setReplyContent((prev) => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[var(--accent)] rounded-lg transition-colors cursor-pointer"
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Reply Button */}
                <button
                  type="submit"
                  disabled={
                    (!replyContent.trim() && replyMediaUrls.length === 0) ||
                    replyMutation.isPending ||
                    isUploadingMedia
                  }
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-1.5"
                >
                  {replyMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>Trả lời</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between py-2 px-1">
            <span className="text-xs text-[var(--muted-foreground)]">
              Đăng nhập để tham gia thảo luận với @{author.username || "user"}
            </span>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>

      {/* ── Replies / Comments List ──────────────────────────────────────────── */}
      <section className="pt-2">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-3 px-1">
          Câu trả lời ({replies.length})
        </h2>

        {/* Loading replies */}
        {isRepliesLoading && (
          <div className="flex flex-col gap-4 py-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-[var(--muted)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-28 bg-[var(--muted)] rounded" />
                  <div className="h-3 w-3/4 bg-[var(--muted)] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty replies state */}
        {!isRepliesLoading && replies.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">
            Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời!
          </div>
        )}

        {/* Replies items with thread line */}
        <div className="divide-y divide-[var(--border)]">
          {replies.map((reply) => {
            const replyAuthor = reply.user || {};
            const isReplyOwner =
              currentUser &&
              (currentUser.id === reply.user_id ||
                currentUser.username === replyAuthor.username);
            const isReplyLiked = Boolean(reply.is_liked);
            const replyLikesCount = reply.likes_count || 0;

            return (
              <div
                key={reply.id}
                className="py-3.5 flex gap-3 hover:bg-[var(--accent)]/15 -mx-3 px-3 rounded-xl transition-colors"
              >
                {/* Reply Author Avatar */}
                <div className="flex flex-col items-center shrink-0">
                  <Link
                    to={`/@${replyAuthor.username || "user"}`}
                    className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-xs text-[var(--foreground)] overflow-hidden border border-[var(--border)] hover:opacity-90 transition-opacity"
                  >
                    {replyAuthor.avatar_url ? (
                      <img
                        src={replyAuthor.avatar_url}
                        alt={replyAuthor.username || "avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (
                        replyAuthor.username?.[0] ||
                        replyAuthor.name?.[0] ||
                        "U"
                      ).toUpperCase()
                    )}
                  </Link>
                </div>

                {/* Reply Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        to={`/@${replyAuthor.username || "user"}`}
                        className="font-bold text-xs sm:text-sm text-[var(--foreground)] hover:underline truncate"
                      >
                        {replyAuthor.username || replyAuthor.name}
                      </Link>
                      {replyAuthor.verified && (
                        <CheckCircle2
                          size={13}
                          className="text-blue-500 fill-blue-500/20 shrink-0"
                        />
                      )}
                      <span className="text-[11px] text-[var(--muted-foreground)] shrink-0">
                        • {formatRelativeTime(reply.created_at)}
                      </span>
                    </div>

                    {/* Quick options for reply */}
                    {isReplyOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPost(reply);
                          setActiveModal("delete");
                        }}
                        className="text-[var(--muted-foreground)] hover:text-rose-500 p-1 rounded-full transition-colors cursor-pointer"
                        title="Xóa câu trả lời"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line break-words">
                    {reply.content}
                  </p>

                  {/* Reply media if any */}
                  {reply.media_urls && reply.media_urls.length > 0 && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border)] max-h-60 bg-black/5">
                      <img
                        src={reply.media_urls[0]}
                        alt="Reply attachment"
                        className="w-full h-full object-cover max-h-60"
                      />
                    </div>
                  )}

                  {/* Reply mini action bar */}
                  <div className="flex items-center gap-4 mt-2 text-[var(--muted-foreground)]">
                    <button
                      type="button"
                      onClick={() => handleLikeToggle(reply.id)}
                      className={`flex items-center gap-1 text-xs hover:text-[var(--foreground)] transition-colors cursor-pointer ${
                        isReplyLiked ? "text-rose-500 font-semibold" : ""
                      }`}
                    >
                      <Heart
                        size={15}
                        className={isReplyLiked ? "fill-current text-rose-500" : ""}
                      />
                      {replyLikesCount > 0 && <span>{replyLikesCount}</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPost(reply);
                        setActiveModal("reply");
                      }}
                      className="flex items-center gap-1 text-xs hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      <MessageCircle size={15} />
                      <span>Trả lời</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(reply)}
                      className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Sao chép liên kết"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Infinite Scroll Sentinel for replies */}
        <div ref={loadMoreRepliesRef} className="py-6 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span>Đang tải thêm câu trả lời...</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Modals Integration ────────────────────────────────────────────────── */}
      {/* 1. Reply Modal with 5-button toolbar */}
      <ReplyModal
        isOpen={activeModal === "reply"}
        onClose={() => setActiveModal(null)}
        post={selectedPost || post}
        onSubmit={handleModalReplySubmit}
      />

      {/* 2. Quote Modal */}
      <QuoteModal
        isOpen={activeModal === "quote"}
        onClose={() => setActiveModal(null)}
        post={selectedPost || post}
        onSubmit={handleModalQuoteSubmit}
      />

      {/* 3. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />

      {/* 3.1 Edit Post Modal */}
      <EditPostModal
        isOpen={activeModal === "editPost"}
        onClose={() => setActiveModal(null)}
        post={selectedPost || post}
        onConfirm={(newContent) => {
          const targetId = selectedPost?.id || post.id;
          editMutation.mutate(
            { postId: targetId, content: newContent },
            {
              onSuccess: () => {
                setActiveModal(null);
                refetchPost();
              },
            }
          );
        }}
        isUpdating={editMutation.isPending}
      />

      {/* 4. Block Modal */}
      <BlockConfirmModal
        isOpen={activeModal === "block"}
        onClose={() => setActiveModal(null)}
        username={selectedUser?.username || author.username}
        onConfirm={() => {
          setActiveModal(null);
          toast.success(`Đã chặn @${selectedUser?.username || author.username}!`);
        }}
      />

      {/* 5. Report Modal */}
      <ReportModal
        isOpen={activeModal === "report"}
        onClose={() => setActiveModal(null)}
        onSubmit={() => {
          setActiveModal(null);
          toast.success(
            "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét bài viết này."
          );
        }}
      />

      {/* 6. Embed Modal */}
      <EmbedModal
        isOpen={activeModal === "embed"}
        onClose={() => setActiveModal(null)}
        post={selectedPost || post}
      />
    </div>
  );
}
