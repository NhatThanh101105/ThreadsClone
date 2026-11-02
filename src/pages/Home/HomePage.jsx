import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import copy from "copy-to-clipboard";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Loader2, ArrowUp } from "lucide-react";

import PostCard from "@/components/post/PostCard";
import CreatePostBox from "@/components/post/CreatePostBox";
import BlockConfirmModal from "@/components/modal/BlockConfirmModal";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import ReportModal from "@/components/modal/ReportModal";
import ReplyModal from "@/components/modal/ReplyModal";
import QuoteModal from "@/components/modal/QuoteModal";
import EmbedModal from "@/components/modal/EmbedModal";
import CreatePostModal from "@/components/modal/CreatePostModal";
import EditPostModal from "@/components/modal/EditPostModal";

import {
  useFeed,
  useLikeToggle,
  useRepostToggle,
  useSaveToggle,
  useDeletePost,
  useReplyPost,
  useQuotePost,
  useCreatePost,
  useEditPost,
  useFollowToggle,
} from "@/hooks/usePosts";

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("for_you"); // "for_you" | "following" | "ghost"

  // Modal control states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // ── React Query: Infinite feed ──────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useFeed(activeTab);

  // Flatten all pages into a single posts array
  const posts = useMemo(() => {
    return (
      data?.pages?.flatMap((page) => {
        // Shape: { success: true, data: { data: [...], current_page, last_page } }  (paginated)
        if (Array.isArray(page?.data?.data)) return page.data.data;
        // Shape: { success: true, data: [...] }  (simple array)
        if (Array.isArray(page?.data)) return page.data;
        // Shape: bare array
        if (Array.isArray(page)) return page;
        return [];
      }) ?? []
    );
  }, [data]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const likeMutation = useLikeToggle();
  const repostMutation = useRepostToggle();
  const saveMutation = useSaveToggle();
  const deleteMutation = useDeletePost();
  const replyMutation = useReplyPost();
  const quoteMutation = useQuotePost();
  const createMutation = useCreatePost();
  const editMutation = useEditPost();
  const followMutation = useFollowToggle();

  // ── Infinite Scroll via IntersectionObserver ────────────────────────────────
  const loadMoreRef = useRef(null);

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
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [handleObserver]);

  // ── Reset feed when switching tabs ─────────────────────────────────────────
  const [newPostsCount, setNewPostsCount] = useState(0);
  const firstPostIdRef = useRef(null);
  const isNearTopRef = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNewPostsCount(0);
    firstPostIdRef.current = null;
  }, [activeTab]);

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      isNearTopRef.current = window.scrollY < 120;
      if (isNearTopRef.current && newPostsCount > 0) {
        setNewPostsCount(0);
        if (posts.length > 0) {
          firstPostIdRef.current = posts[0]?.id;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [newPostsCount, posts]);

  // Check for newly polled posts
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    if (!firstPostIdRef.current) {
      firstPostIdRef.current = posts[0]?.id;
      return;
    }

    if (posts[0]?.id !== firstPostIdRef.current) {
      if (isNearTopRef.current) {
        firstPostIdRef.current = posts[0]?.id;
        setNewPostsCount(0);
      } else {
        const index = posts.findIndex((p) => p.id === firstPostIdRef.current);
        const count = index > 0 ? index : 1;
        setNewPostsCount(count);
      }
    }
  }, [posts]);

  const handleScrollToTopAndRefresh = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (posts.length > 0) {
      firstPostIdRef.current = posts[0]?.id;
    }
    setNewPostsCount(0);
    refetch();
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLikeToggle = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    likeMutation.mutate({ postId, isLiked: Boolean(post.is_liked) });
  };

  const handleRepostToggle = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    repostMutation.mutate(
      { postId, isReposted: Boolean(post.is_reposted) },
      {
        onSuccess: () => toast.success("Cập nhật đăng lại thành công!"),
      }
    );
  };

  const handleSaveToggle = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const isSaved = Boolean(post.is_saved);
    saveMutation.mutate(
      { postId, isSaved },
      {
        onSuccess: () =>
          toast.success(isSaved ? "Đã bỏ lưu bài viết!" : "Đã lưu bài viết!"),
      }
    );
  };

  const handleHidePost = (_postId) => {
    // Local hide: just refetch or remove from UI via cache invalidation
    toast.info("Đã ẩn bài viết khỏi bảng tin.");
  };

  const handleMuteUser = () => toast.info("Đã tắt tiếng người dùng.");
  const handleRestrictUser = () => toast.info("Đã hạn chế người dùng.");

  const handleCopyLink = (post) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const username = post.user?.username || "user";
    copy(`${origin}/${username}/post/${post.id}`);
    toast.success(t("post.copiedLink"));
  };

  const handleCopyAsImage = async (cardElement, post) => {
    if (!cardElement) return;
    try {
      toast.info("Đang xuất bài viết thành hình ảnh...");
      const dataUrl = await toPng(cardElement, {
        cacheBust: true,
        backgroundColor: "#101010",
      });
      const link = document.createElement("a");
      link.download = `threads-post-${post.id}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Đã tải ảnh bài viết thành công!");
    } catch {
      toast.error("Không thể xuất ảnh từ bài viết này.");
    }
  };

  const handleReplySubmit = ({ content, media_urls, targetPostId, reply_permission }) => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để trả lời.");
      return;
    }
    replyMutation.mutate({ parentPostId: targetPostId, content, media_urls, reply_permission });
  };

  const handleQuoteSubmit = ({ content, media_urls, quotedPostId, reply_permission }) => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để trích dẫn.");
      return;
    }
    quoteMutation.mutate({ originalPostId: quotedPostId, content, media_urls, reply_permission });
  };

  const handleCreatePost = (postData) => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để đăng bài viết.");
      return;
    }
    createMutation.mutate(postData);
  };

  const handleDeleteConfirm = () => {
    if (!selectedPost) return;
    deleteMutation.mutate({ postId: selectedPost.id });
  };

  const handleBlockConfirm = () => {
    if (!selectedUser) return;
    toast.success(`Đã chặn @${selectedUser.username}!`);
  };

  const handleReportConfirm = () => {
    toast.success("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ sớm xem xét bài viết này.");
  };

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "for_you", label: t("home.forYou") },
    { id: "following", label: t("home.following") },
    { id: "ghost", label: t("home.ghost") },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Sticky Tab Header */}
      <div className="sticky top-0 z-30 flex border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md -mt-4 md:-mt-6 mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`home-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-center text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-[var(--foreground)] text-[var(--foreground)] font-bold"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Create Post Box */}
      <CreatePostBox onOpenCreateModal={() => setActiveModal("create")} />

      {/* Floating New Posts Indicator (Auto-updates) */}
      {newPostsCount > 0 && (
        <div className="sticky top-14 z-20 flex justify-center py-1.5 pointer-events-none animate-in fade-in slide-in-from-top-2">
          <button
            type="button"
            onClick={handleScrollToTopAndRefresh}
            className="pointer-events-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[var(--border)]"
          >
            <ArrowUp size={13} className="stroke-[3]" />
            <span>
              {newPostsCount > 1
                ? `${newPostsCount} bài viết mới`
                : "Có bài viết mới"}
            </span>
          </button>
        </div>
      )}

      {/* Feed Area */}
      <div className="divide-y divide-transparent">
        {/* Loading skeleton on first load */}
        {isLoading && (
          <div className="flex flex-col gap-4 py-4">
            {[...Array(4)].map((_, i) => (
              <FeedSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Không thể tải bài viết. Vui lòng thử lại.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className="py-16 text-center text-sm text-[var(--muted-foreground)]">
            {t("home.emptyFeed")}
          </div>
        )}

        {/* Post list */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onOpenReply={(p) => {
              setSelectedPost(p);
              setActiveModal("reply");
            }}
            onOpenQuote={(p) => {
              setSelectedPost(p);
              setActiveModal("quote");
            }}
            onRepostToggle={handleRepostToggle}
            onSaveToggle={handleSaveToggle}
            onHidePost={handleHidePost}
            onMuteUser={handleMuteUser}
            onRestrictUser={handleRestrictUser}
            onOpenBlockModal={(user) => {
              setSelectedUser(user);
              setActiveModal("block");
            }}
            onOpenReportModal={(p) => {
              setSelectedPost(p);
              setActiveModal("report");
            }}
            onOpenDeleteModal={(p) => {
              setSelectedPost(p);
              setActiveModal("delete");
            }}
            onOpenEditModal={(p) => {
              setSelectedPost(p);
              setActiveModal("editPost");
            }}
            onFollowToggle={(userId) => {
              if (!isAuthenticated) {
                navigate("/login");
                return;
              }
              followMutation.mutate({ userId, isFollowed: false });
            }}
            onOpenEmbedModal={(p) => {
              setSelectedPost(p);
              setActiveModal("embed");
            }}
            onCopyLink={handleCopyLink}
            onCopyAsImage={handleCopyAsImage}
          />
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="h-4" />

        {/* Load more spinner */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <Loader2 size={22} className="animate-spin text-[var(--muted-foreground)]" />
          </div>
        )}

        {/* End of feed message */}
        {!hasNextPage && posts.length > 0 && !isLoading && (
          <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
            Bạn đã xem hết bài viết 🎉
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={activeModal === "create"}
        onClose={() => setActiveModal(null)}
        onSubmitPost={handleCreatePost}
        isSubmitting={createMutation.isPending}
      />

      <ReplyModal
        isOpen={activeModal === "reply"}
        onClose={() => setActiveModal(null)}
        targetPost={selectedPost}
        onSubmitReply={handleReplySubmit}
        isSubmitting={replyMutation.isPending}
      />

      <QuoteModal
        isOpen={activeModal === "quote"}
        onClose={() => setActiveModal(null)}
        targetPost={selectedPost}
        onSubmitQuote={handleQuoteSubmit}
        isSubmitting={quoteMutation.isPending}
      />

      <EmbedModal
        isOpen={activeModal === "embed"}
        onClose={() => setActiveModal(null)}
        post={selectedPost}
      />

      <EditPostModal
        isOpen={activeModal === "editPost"}
        onClose={() => setActiveModal(null)}
        post={selectedPost}
        onConfirm={(newContent) => {
          if (!selectedPost) return;
          editMutation.mutate(
            { postId: selectedPost.id, content: newContent },
            {
              onSuccess: () => {
                setActiveModal(null);
                refetch();
              },
            }
          );
        }}
        isUpdating={editMutation.isPending}
      />

      <BlockConfirmModal
        isOpen={activeModal === "block"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleBlockConfirm}
        username={selectedUser?.username || "user"}
      />

      <DeleteConfirmModal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeleteConfirm}
        isSubmitting={deleteMutation.isPending}
      />

      <ReportModal
        isOpen={activeModal === "report"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleReportConfirm}
      />
    </div>
  );
}

// ── Feed Skeleton Component ─────────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="py-4 border-b border-[var(--border)] -mx-3 sm:-mx-4 px-3 sm:px-4 animate-pulse">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--muted)] shrink-0" />
        <div className="flex-1 space-y-2">
          {/* Username row */}
          <div className="flex gap-2 items-center">
            <div className="h-3 w-24 rounded bg-[var(--muted)]" />
            <div className="h-3 w-10 rounded bg-[var(--muted)]" />
          </div>
          {/* Content lines */}
          <div className="h-3 w-full rounded bg-[var(--muted)]" />
          <div className="h-3 w-4/5 rounded bg-[var(--muted)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--muted)]" />
          {/* Interaction bar */}
          <div className="flex gap-4 pt-2">
            <div className="h-3 w-8 rounded bg-[var(--muted)]" />
            <div className="h-3 w-8 rounded bg-[var(--muted)]" />
            <div className="h-3 w-8 rounded bg-[var(--muted)]" />
            <div className="h-3 w-8 rounded bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
