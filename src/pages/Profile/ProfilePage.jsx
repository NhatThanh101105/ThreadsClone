import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import {
  CheckCircle2,
  Copy,
  Edit3,
  Share2,
  Loader2,
  UserPlus,
  Lock,
  Repeat2,
} from "lucide-react";

import PostCard from "@/components/post/PostCard";
import EditProfileModal from "@/components/modal/EditProfileModal";
import EditPostModal from "@/components/modal/EditPostModal";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import ReplyModal from "@/components/modal/ReplyModal";
import QuoteModal from "@/components/modal/QuoteModal";
import EmbedModal from "@/components/modal/EmbedModal";

import {
  useUserPosts,
  useLikeToggle,
  useRepostToggle,
  useSaveToggle,
  useDeletePost,
  useEditPost,
  useFollowToggle,
  useUpdateProfile,
  useReplyPost,
  useQuotePost,
} from "@/hooks/usePosts";
import { setCurrentUser, fetchCurrentUser } from "@/store/slices/authSlice";

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  // Active tab: "threads" | "replies" | "reposts"
  const [activeTab, setActiveTab] = useState("threads");

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "editPost" | "deletePost" | "reply" | "quote" | "embed"
  const [selectedPost, setSelectedPost] = useState(null);

  // Target user determination
  const isSelf =
    !paramUsername ||
    Boolean(
      currentUser &&
        (currentUser.username?.toLowerCase() === paramUsername?.toLowerCase() ||
          `@${currentUser.username?.toLowerCase()}` === paramUsername?.toLowerCase())
    );

  const targetUsername = isSelf
    ? currentUser?.username
    : paramUsername?.replace(/^@/, "");

  const targetUserId = isSelf ? currentUser?.id : null;

  // ── Queries & Mutations ─────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPostsLoading,
    refetch: refetchPosts,
  } = useUserPosts(targetUsername, targetUserId);

  const posts = useMemo(() => {
    return (
      data?.pages?.flatMap((page) => {
        if (Array.isArray(page?.data?.data)) return page.data.data;
        if (Array.isArray(page?.data)) return page.data;
        if (Array.isArray(page)) return page;
        return [];
      }) ?? []
    );
  }, [data]);

  // 1. All posts related strictly to target user: authored, quoted, or reposted by user
  const userRelatedPosts = useMemo(() => {
    const targetLower = targetUsername?.toLowerCase();
    return posts.filter((p) => {
      const authorUsername = p.user?.username?.toLowerCase();
      const isAuthor =
        (targetLower && authorUsername === targetLower) ||
        (targetUserId && p.user_id === targetUserId);
      const isQuote =
        Boolean(p.is_quote) &&
        ((targetLower && authorUsername === targetLower) ||
          (targetUserId && p.user_id === targetUserId));
      const isRepost = isSelf && Boolean(p.is_reposted);

      return isAuthor || isQuote || isRepost;
    });
  }, [posts, targetUsername, targetUserId, isSelf]);

  // 2. Filter posts strictly by active tab
  const filteredPosts = useMemo(() => {
    const targetLower = targetUsername?.toLowerCase();

    if (activeTab === "threads") {
      // Chỉ hiện bài viết chính do user đăng (không phải câu trả lời, không phải quote)
      return userRelatedPosts.filter((p) => {
        const authorUsername = p.user?.username?.toLowerCase();
        const isAuthor =
          (targetLower && authorUsername === targetLower) ||
          (targetUserId && p.user_id === targetUserId);
        return isAuthor && !p.parent_id && !p.is_quote;
      });
    }

    if (activeTab === "replies") {
      // Chỉ hiện câu trả lời / bình luận do user đăng
      return userRelatedPosts.filter((p) => {
        const authorUsername = p.user?.username?.toLowerCase();
        const isAuthor =
          (targetLower && authorUsername === targetLower) ||
          (targetUserId && p.user_id === targetUserId);
        return isAuthor && Boolean(p.parent_id);
      });
    }

    if (activeTab === "reposts") {
      // Chỉ hiện bài viết user đã Đăng lại hoặc Trích dẫn (Quote)
      return userRelatedPosts.filter((p) => {
        const authorUsername = p.user?.username?.toLowerCase();
        const isQuote =
          Boolean(p.is_quote) &&
          ((targetLower && authorUsername === targetLower) ||
            (targetUserId && p.user_id === targetUserId));
        const isRepost = Boolean(p.is_reposted);
        return isQuote || isRepost;
      });
    }

    return userRelatedPosts;
  }, [userRelatedPosts, activeTab, targetUsername, targetUserId]);

  const likeMutation = useLikeToggle();
  const repostMutation = useRepostToggle();
  const saveMutation = useSaveToggle();
  const deleteMutation = useDeletePost();
  const editMutation = useEditPost();
  const followMutation = useFollowToggle();
  const updateProfileMutation = useUpdateProfile();
  const replyMutation = useReplyPost();
  const quoteMutation = useQuotePost();

  // Auto-fetch next page if we don't have enough posts for this user yet
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && userRelatedPosts.length < 15) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, userRelatedPosts.length, fetchNextPage]);

  // ── Infinite scroll sentinel ────────────────────────────────────────────────
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

  // Display user info (use currentUser if self, else derived from user's actual post)
  const displayUser = isSelf
    ? currentUser
    : userRelatedPosts[0]?.user || { username: targetUsername, name: targetUsername };

  const displayName = displayUser?.name || displayUser?.username || "User";
  const displayAvatar = displayUser?.avatar_url || displayUser?.avatar;
  const displayBio = displayUser?.bio;
  const isVerified = Boolean(displayUser?.verified);
  const isPrivate = Boolean(displayUser?.is_private);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/@${targetUsername}`;
    copy(profileUrl);
    toast.success("Đã sao chép liên kết trang cá nhân!");
  };

  const handleSaveProfile = (formData) => {
    updateProfileMutation.mutate(formData, {
      onSuccess: (res) => {
        const updated = res?.data || res;
        dispatch(
          setCurrentUser({
            ...currentUser,
            ...updated,
          })
        );
        dispatch(fetchCurrentUser());
        setIsEditProfileOpen(false);
        refetchPosts();
      },
    });
  };

  const handleEditPostConfirm = (newContent) => {
    if (!selectedPost) return;
    editMutation.mutate(
      { postId: selectedPost.id, content: newContent },
      {
        onSuccess: () => {
          setActiveModal(null);
          refetchPosts();
        },
      }
    );
  };

  const handleDeletePostConfirm = () => {
    if (!selectedPost) return;
    deleteMutation.mutate(
      { postId: selectedPost.id },
      {
        onSuccess: () => {
          setActiveModal(null);
          refetchPosts();
        },
      }
    );
  };

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!displayUser?.id) return;
    followMutation.mutate({
      userId: displayUser.id,
      isFollowed: Boolean(displayUser?.is_following),
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto pb-20">
      {/* ── Profile Header Section ───────────────────────────────────────────── */}
      <div className="pt-2 pb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* User Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-2xl font-bold text-[var(--foreground)] truncate flex items-center gap-1.5">
              <span>{displayName}</span>
              {isVerified && (
                <CheckCircle2
                  size={18}
                  className="text-blue-500 fill-blue-500/20 shrink-0"
                />
              )}
              {isPrivate && (
                <Lock
                  size={15}
                  className="text-[var(--muted-foreground)] shrink-0"
                  title="Tài khoản riêng tư"
                />
              )}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <span>@{targetUsername}</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-[10px] text-[var(--muted-foreground)]">
                threads.net
              </span>
            </div>

            {/* Bio */}
            {displayBio ? (
              <p className="text-sm text-[var(--foreground)] whitespace-pre-line leading-relaxed pt-2">
                {displayBio}
              </p>
            ) : (
              isSelf && (
                <p className="text-xs text-[var(--muted-foreground)] italic pt-2">
                  Chưa có tiểu sử. Bấm chỉnh sửa để giới thiệu bản thân...
                </p>
              )
            )}
          </div>

          {/* Large Avatar */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-2xl text-[var(--foreground)] overflow-hidden shrink-0 border-2 border-[var(--border)] shadow-xs">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              (displayName[0] || "U").toUpperCase()
            )}
          </div>
        </div>

        {/* Profile Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {isSelf ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="flex-1 py-2 px-4 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 size={14} />
                <span>Chỉnh sửa trang cá nhân</span>
              </button>

              <button
                type="button"
                onClick={handleShareProfile}
                title="Chia sẻ trang cá nhân"
                className="py-2 px-3 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer flex items-center justify-center"
              >
                <Share2 size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleFollowToggle}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>Theo dõi</span>
              </button>

              <button
                type="button"
                onClick={handleShareProfile}
                title="Sao chép liên kết"
                className="py-2 px-3 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer flex items-center justify-center"
              >
                <Copy size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Profile Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex border-b border-[var(--border)] mb-4">
        {[
          { id: "threads", label: "Bài viết" },
          { id: "replies", label: "Câu trả lời" },
          { id: "reposts", label: "Đã đăng lại" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-center text-xs sm:text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-[var(--foreground)] text-[var(--foreground)] font-bold"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Posts Feed List ──────────────────────────────────────────────────── */}
      <div className="divide-y divide-[var(--border)]">
        {/* Loading skeleton */}
        {isPostsLoading && (
          <div className="flex flex-col gap-4 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3 py-3">
                <div className="w-10 h-10 rounded-full bg-[var(--muted)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-28 h-3.5 bg-[var(--muted)] rounded" />
                  <div className="w-3/4 h-3.5 bg-[var(--muted)] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isPostsLoading && filteredPosts.length === 0 && (
          <div className="py-16 text-center text-sm text-[var(--muted-foreground)]">
            {activeTab === "threads" &&
              (isSelf
                ? "Bạn chưa có bài viết nào. Hãy tạo bài viết đầu tiên!"
                : `@${targetUsername} chưa đăng bài viết nào.`)}
            {activeTab === "replies" &&
              (isSelf
                ? "Bạn chưa có câu trả lời nào."
                : `@${targetUsername} chưa có câu trả lời nào.`)}
            {activeTab === "reposts" &&
              (isSelf
                ? "Bạn chưa đăng lại hoặc trích dẫn bài viết nào."
                : `@${targetUsername} chưa đăng lại bài viết nào.`)}
          </div>
        )}

        {/* User Post list */}
        {filteredPosts.map((post) => (
          <div key={post.id} className="relative">
            {activeTab === "reposts" && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-medium pt-3 pb-0.5 px-3 sm:px-4">
                <Repeat2 size={13} className="text-emerald-500 shrink-0" />
                <span>
                  {post.is_quote
                    ? `${displayName} đã trích dẫn`
                    : `${displayName} đã đăng lại`}
                </span>
              </div>
            )}
            <PostCard
              post={post}
              onLikeToggle={(id) =>
                likeMutation.mutate({ postId: id, isLiked: Boolean(post.is_liked) })
              }
              onRepostToggle={(id) =>
                repostMutation.mutate({
                  postId: id,
                  isReposted: Boolean(post.is_reposted),
                })
              }
              onSaveToggle={(id) =>
                saveMutation.mutate({
                  postId: id,
                  isSaved: Boolean(post.is_saved),
                })
              }
              onOpenReply={(p) => {
                setSelectedPost(p);
                setActiveModal("reply");
              }}
              onOpenQuote={(p) => {
                setSelectedPost(p);
                setActiveModal("quote");
              }}
              onOpenDeleteModal={(p) => {
                setSelectedPost(p);
                setActiveModal("deletePost");
              }}
              onOpenEditModal={(p) => {
                setSelectedPost(p);
                setActiveModal("editPost");
              }}
              onOpenEmbedModal={(p) => {
                setSelectedPost(p);
                setActiveModal("embed");
              }}
              onCopyLink={() => {
                const authorUsername = post.user?.username || targetUsername;
                const shareUrl = `${window.location.origin}/@${authorUsername}/post/${post.id}`;
                copy(shareUrl);
                toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
              }}
            />
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {isFetchingNextPage && (
            <Loader2 size={18} className="animate-spin text-[var(--muted-foreground)]" />
          )}
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {/* 1. Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onSave={handleSaveProfile}
        isSaving={updateProfileMutation.isPending}
      />

      {/* 2. Edit Post Modal */}
      <EditPostModal
        isOpen={activeModal === "editPost"}
        onClose={() => setActiveModal(null)}
        post={selectedPost}
        onConfirm={handleEditPostConfirm}
        isUpdating={editMutation.isPending}
      />

      {/* 3. Delete Post Confirm Modal */}
      <DeleteConfirmModal
        isOpen={activeModal === "deletePost"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeletePostConfirm}
        isDeleting={deleteMutation.isPending}
      />

      {/* 4. Reply Modal */}
      <ReplyModal
        isOpen={activeModal === "reply"}
        onClose={() => setActiveModal(null)}
        post={selectedPost}
        onSubmitReply={(formData) => {
          replyMutation.mutate(
            { parentPostId: selectedPost.id, ...formData },
            {
              onSuccess: () => {
                setActiveModal(null);
                refetchPosts();
              },
            }
          );
        }}
      />

      {/* 5. Quote Modal */}
      <QuoteModal
        isOpen={activeModal === "quote"}
        onClose={() => setActiveModal(null)}
        post={selectedPost}
        onSubmitQuote={(formData) => {
          quoteMutation.mutate(
            { originalPostId: selectedPost.id, ...formData },
            {
              onSuccess: () => {
                setActiveModal(null);
                refetchPosts();
              },
            }
          );
        }}
      />

      {/* 6. Embed Modal */}
      <EmbedModal
        isOpen={activeModal === "embed"}
        onClose={() => setActiveModal(null)}
        post={selectedPost}
      />
    </div>
  );
}
