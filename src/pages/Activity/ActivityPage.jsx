import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Quote,
  CheckCircle2,
  Bell,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useUserPosts, useFollowToggle } from "@/hooks/usePosts";
import { formatRelativeTime } from "@/lib/dateUtils";

// Mock community seed notifications to provide a rich, engaging Threads activity feed
const COMMUNITY_SEEDS = [
  {
    id: "seed-1",
    type: "follow",
    actor: {
      id: 101,
      name: "Kỳ Duyên",
      username: "kyduyen1311",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      verified: true,
    },
    message: "đã bắt đầu theo dõi bạn.",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15m ago
    is_following: false,
    verified: true,
  },
  {
    id: "seed-2",
    type: "like",
    actor: {
      id: 102,
      name: "Tuấn Võ",
      username: "tuan_vo2019",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      verified: false,
    },
    message: "đã thích bài viết của bạn.",
    postPreview: "Chào mừng mọi người đến với Threads clone!",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
    verified: false,
  },
  {
    id: "seed-3",
    type: "reply",
    actor: {
      id: 103,
      name: "Food Threads",
      username: "tjodbatadqm",
      avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
      verified: false,
    },
    message: "đã trả lời bạn: 'Trải nghiệm mượt mà quá bạn ơi, giao diện rất giống Threads thật!'",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
    verified: false,
  },
  {
    id: "seed-4",
    type: "repost",
    actor: {
      id: 104,
      name: "Threads Official",
      username: "threads",
      avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
      verified: true,
    },
    message: "đã đăng lại chuỗi bài viết của bạn.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12h ago
    verified: true,
  },
  {
    id: "seed-5",
    type: "quote",
    actor: {
      id: 105,
      name: "Minh Trang",
      username: "minhtrang_dev",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      verified: false,
    },
    message: "đã trích dẫn bài viết của bạn: 'Chuỗi bài phân tích này đỉnh thật sự 🚀'",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
    verified: false,
  },
  {
    id: "seed-6",
    type: "follow",
    actor: {
      id: 106,
      name: "Huy Hoàng",
      username: "huyhoang99",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      verified: false,
    },
    message: "đã bắt đầu theo dõi bạn.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5d ago
    is_following: true,
    verified: false,
  },
];

export default function ActivityPage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  // Active filter tab: "all" | "follows" | "replies" | "likes" | "reposts" | "quotes" | "verified"
  const [activeFilter, setActiveFilter] = useState("all");

  // Local state to track follow back status optimistically
  const [followingStates, setFollowingStates] = useState({});

  const followMutation = useFollowToggle();

  // Fetch current user posts to synthesize real activity on their threads
  const {
    data: userPostsData,
  } = useUserPosts(currentUser?.username, currentUser?.id);

  const myPosts = useMemo(() => {
    return userPostsData?.pages?.flatMap((page) => {
      if (Array.isArray(page?.data?.data)) return page.data.data;
      if (Array.isArray(page?.data)) return page.data;
      if (Array.isArray(page)) return page;
      return [];
    }) ?? [];
  }, [userPostsData]);

  // Combine user's own live posts and seed notifications
  const allActivities = useMemo(() => {
    const list = [...COMMUNITY_SEEDS];

    // If current user has real posts, create activity entries for them
    if (myPosts.length > 0) {
      myPosts.forEach((post) => {
        // User's own post event
        list.push({
          id: `post-self-${post.id}`,
          type: "post",
          actor: {
            id: currentUser?.id,
            name: currentUser?.name || currentUser?.username,
            username: currentUser?.username,
            avatar_url: currentUser?.avatar_url || currentUser?.avatar,
            verified: Boolean(currentUser?.verified),
          },
          message: post.content
            ? `Bạn đã đăng: "${post.content.length > 60 ? post.content.slice(0, 60) + "..." : post.content}"`
            : "Bạn đã đăng một bài viết mới kèm hình ảnh.",
          media_urls: post.media_urls || [],
          postId: post.id,
          created_at: post.created_at,
          verified: Boolean(currentUser?.verified),
          isSelf: true,
        });

        // If post has likes, add like activity
        if (post.likes_count > 0) {
          list.push({
            id: `like-post-${post.id}`,
            type: "like",
            actor: {
              id: 999,
              name: "Cộng đồng Threads",
              username: "threads_members",
              avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
              verified: false,
            },
            message: `và ${post.likes_count} người khác đã thích bài viết của bạn.`,
            postPreview: post.content,
            postId: post.id,
            created_at: post.updated_at || post.created_at,
            verified: false,
          });
        }

        // If post has replies, add reply activity
        if (post.replies_count > 0) {
          list.push({
            id: `reply-post-${post.id}`,
            type: "reply",
            actor: {
              id: 998,
              name: "Thành viên Threads",
              username: "threads_user",
              avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
              verified: false,
            },
            message: `đã bình luận bài viết của bạn (${post.replies_count} câu trả lời).`,
            postPreview: post.content,
            postId: post.id,
            created_at: post.updated_at || post.created_at,
            verified: false,
          });
        }
      });
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [myPosts, currentUser]);

  // Filter activities based on active tab
  const filteredActivities = useMemo(() => {
    if (activeFilter === "all") return allActivities;
    if (activeFilter === "follows") return allActivities.filter((a) => a.type === "follow");
    if (activeFilter === "replies") return allActivities.filter((a) => a.type === "reply");
    if (activeFilter === "likes") return allActivities.filter((a) => a.type === "like");
    if (activeFilter === "reposts") return allActivities.filter((a) => a.type === "repost");
    if (activeFilter === "quotes") return allActivities.filter((a) => a.type === "quote");
    if (activeFilter === "verified") return allActivities.filter((a) => a.verified);
    return allActivities;
  }, [allActivities, activeFilter]);

  const handleToggleFollow = (actor) => {
    const isCurrentlyFollowing =
      followingStates[actor.id] !== undefined
        ? followingStates[actor.id]
        : Boolean(actor.is_following);

    const nextState = !isCurrentlyFollowing;
    setFollowingStates((prev) => ({ ...prev, [actor.id]: nextState }));

    followMutation.mutate(
      { userId: actor.id, isFollowing: isCurrentlyFollowing },
      {
        onSuccess: () => {
          toast.success(nextState ? `Đã theo dõi @${actor.username}` : `Đã bỏ theo dõi @${actor.username}`);
        },
        onError: () => {
          // Revert optimistic update
          setFollowingStates((prev) => ({ ...prev, [actor.id]: isCurrentlyFollowing }));
        },
      }
    );
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case "like":
        return (
          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-[var(--card)]">
            <Heart size={10} className="fill-white" />
          </div>
        );
      case "reply":
        return (
          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-[var(--card)]">
            <MessageCircle size={10} className="fill-white" />
          </div>
        );
      case "follow":
        return (
          <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-[var(--card)]">
            <UserPlus size={10} />
          </div>
        );
      case "repost":
        return (
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-[var(--card)]">
            <Repeat2 size={10} />
          </div>
        );
      case "quote":
        return (
          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-[var(--card)]">
            <Quote size={10} />
          </div>
        );
      case "post":
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-zinc-600 text-white flex items-center justify-center border-2 border-[var(--card)]">
            <Sparkles size={10} />
          </div>
        );
    }
  };

  const filterTabs = [
    { id: "all", label: "Tất cả" },
    { id: "follows", label: "Theo dõi" },
    { id: "replies", label: "Câu trả lời" },
    { id: "likes", label: "Lượt thích" },
    { id: "reposts", label: "Đăng lại" },
    { id: "quotes", label: "Trích dẫn" },
    { id: "verified", label: "Đã xác minh" },
  ];

  return (
    <div className="w-full max-w-[620px] mx-auto pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md pt-3 pb-2 border-b border-[var(--border)]">
        <h1 className="text-xl sm:text-2xl font-bold px-4 mb-3 text-[var(--foreground)]">
          Hoạt động
        </h1>

        {/* Filter Tabs Scrollable */}
        <div className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
                    : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--accent)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-[var(--border)] mt-1">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-20 px-4 text-[var(--muted-foreground)] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mx-auto text-[var(--foreground)]">
              <Bell size={22} />
            </div>
            <p className="font-semibold text-sm text-[var(--foreground)]">
              Chưa có hoạt động nào trong mục này
            </p>
            <p className="text-xs max-w-xs mx-auto">
              Khi có người tương tác với bạn, thông báo và hoạt động sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          filteredActivities.map((item) => {
            const isFollowing =
              followingStates[item.actor.id] !== undefined
                ? followingStates[item.actor.id]
                : Boolean(item.actor.is_following);

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-[var(--accent)]/30 transition-colors flex items-start gap-3.5 group"
              >
                {/* Actor Avatar with Type Badge */}
                <div className="relative shrink-0">
                  <Link
                    to={item.isSelf ? "/profile" : `/@${item.actor.username}`}
                    className="block w-10 h-10 rounded-full overflow-hidden bg-[var(--muted)] border border-[var(--border)]"
                  >
                    {item.actor.avatar_url ? (
                      <img
                        src={item.actor.avatar_url}
                        alt={item.actor.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[var(--foreground)]">
                        {(item.actor.username?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="absolute -bottom-1 -right-1">
                    {getBadgeIcon(item.type)}
                  </div>
                </div>

                {/* Content body */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      to={item.isSelf ? "/profile" : `/@${item.actor.username}`}
                      className="font-bold text-sm text-[var(--foreground)] hover:underline inline-flex items-center gap-1"
                    >
                      {item.actor.username}
                      {item.verified && (
                        <CheckCircle2
                          size={13}
                          className="text-blue-500 fill-blue-500/20"
                        />
                      )}
                    </Link>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      · {formatRelativeTime(item.created_at)}
                    </span>
                  </div>

                  {/* Action message */}
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  {/* Post preview snippet if applicable */}
                  {item.postPreview && (
                    <div
                      onClick={() => item.postId && navigate(`/post/${item.postId}`)}
                      className="mt-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] line-clamp-2 hover:border-[var(--muted-foreground)]/40 transition-colors cursor-pointer"
                    >
                      "{item.postPreview}"
                    </div>
                  )}

                  {/* Post media preview if user posted with media */}
                  {item.media_urls && item.media_urls.length > 0 && (
                    <div
                      onClick={() => item.postId && navigate(`/post/${item.postId}`)}
                      className="mt-2 flex gap-2 overflow-x-auto cursor-pointer"
                    >
                      {item.media_urls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Attachment"
                          className="w-16 h-16 rounded-lg object-cover border border-[var(--border)] hover:opacity-90"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right action button */}
                <div className="shrink-0 pt-1">
                  {item.type === "follow" && !item.isSelf && (
                    <button
                      type="button"
                      onClick={() => handleToggleFollow(item.actor)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isFollowing
                          ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--accent)]"
                          : "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90"
                      }`}
                    >
                      {isFollowing ? "Đang theo dõi" : "Theo dõi lại"}
                    </button>
                  )}

                  {item.postId && item.type !== "follow" && (
                    <button
                      type="button"
                      onClick={() => navigate(`/post/${item.postId}`)}
                      title="Xem bài viết"
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
