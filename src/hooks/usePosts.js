import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import postsApi from "@/services/posts.api";
import { toast } from "sonner";

// ─── Query Keys ────────────────────────────────────────────────────────────────
export const postKeys = {
  all: ["posts"],
  feed: (tab) => ["posts", "feed", tab],
  detail: (id) => ["posts", "detail", id],
  replies: (id) => ["posts", "replies", id],
  userPosts: (username) => ["posts", "user", username],
  search: (q) => ["posts", "search", q],
};

// ─── Feed Infinite Query ────────────────────────────────────────────────────────
/**
 * Infinite scroll hook for the home feed
 * @param {string} tab - "for_you" | "following" | "ghost"
 */
export function useFeed(tab = "for_you") {
  return useInfiniteQuery({
    queryKey: postKeys.feed(tab),
    queryFn: ({ pageParam = 1 }) => postsApi.getFeed({ page: pageParam, type: tab }),
    getNextPageParam: (lastPage) => {
      // Actual API shape: { success, data: [...posts], pagination: { current_page, last_page } }
      const pagination = lastPage?.pagination;
      if (pagination) {
        const currentPage = pagination.current_page ?? 1;
        const lastPageNum = pagination.last_page ?? 1;
        return currentPage < lastPageNum ? currentPage + 1 : undefined;
      }
      // Fallback: nested pagination inside data
      const nested = lastPage?.data;
      if (nested && typeof nested === "object" && !Array.isArray(nested)) {
        const currentPage = nested.current_page ?? 1;
        const lastPageNum = nested.last_page ?? 1;
        return currentPage < lastPageNum ? currentPage + 1 : undefined;
      }
      // No pagination — single page only
      return undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ─── Post Detail Query ──────────────────────────────────────────────────────────
export function usePostDetail(postId) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postsApi.getPost(postId),
    enabled: Boolean(postId),
  });
}

// ─── Post Replies Infinite Query ───────────────────────────────────────────────
export function usePostReplies(postId) {
  return useInfiniteQuery({
    queryKey: postKeys.replies(postId),
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getPostReplies(postId, { page: pageParam }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (pagination) {
        const currentPage = pagination.current_page ?? 1;
        const lastPageNum = pagination.last_page ?? 1;
        return currentPage < lastPageNum ? currentPage + 1 : undefined;
      }
      return undefined;
    },
    enabled: Boolean(postId),
  });
}


// ─── Like / Unlike Mutation ─────────────────────────────────────────────────────
export function useLikeToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }) =>
      isLiked ? postsApi.unlikePost(postId) : postsApi.likePost(postId),

    // Optimistic update across all feed tabs and post detail
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      const snapshot = {};
      // Update all cached feed pages & replies
      queryClient.setQueriesData({ queryKey: postKeys.all }, (old) => {
        if (!old?.pages) return old;
        snapshot[JSON.stringify(old)] = old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            updatePostInPage(page, postId, (p) => ({
              ...p,
              is_liked: !isLiked,
              likes_count: isLiked
                ? Math.max(0, (p.likes_count || 1) - 1)
                : (p.likes_count || 0) + 1,
            }))
          ),
        };
      });

      // Update single post detail cache if open
      queryClient.setQueryData(postKeys.detail(postId), (old) => {
        if (!old) return old;
        const updateItem = (p) => ({
          ...p,
          is_liked: !isLiked,
          likes_count: isLiked
            ? Math.max(0, (p.likes_count || 1) - 1)
            : (p.likes_count || 0) + 1,
        });
        if (old.data) return { ...old, data: updateItem(old.data) };
        return updateItem(old);
      });

      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      // Rollback on error
      if (ctx?.snapshot) {
        Object.entries(ctx.snapshot).forEach(([key, val]) => {
          queryClient.setQueryData(JSON.parse(key), val);
        });
      }
    },

    onSettled: (_data, _err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      }
    },
  });
}

// ─── Repost / Un-repost Mutation ────────────────────────────────────────────────
export function useRepostToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isReposted }) =>
      isReposted ? postsApi.unrepostPost(postId) : postsApi.repostPost(postId),

    onMutate: async ({ postId, isReposted }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      queryClient.setQueriesData({ queryKey: postKeys.all }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            updatePostInPage(page, postId, (p) => ({
              ...p,
              is_reposted: !isReposted,
              reposts_and_quotes_count: isReposted
                ? Math.max(0, (p.reposts_and_quotes_count || 1) - 1)
                : (p.reposts_and_quotes_count || 0) + 1,
            }))
          ),
        };
      });

      // Update single post detail cache if open
      queryClient.setQueryData(postKeys.detail(postId), (old) => {
        if (!old) return old;
        const updateItem = (p) => ({
          ...p,
          is_reposted: !isReposted,
          reposts_and_quotes_count: isReposted
            ? Math.max(0, (p.reposts_and_quotes_count || 1) - 1)
            : (p.reposts_and_quotes_count || 0) + 1,
        });
        if (old.data) return { ...old, data: updateItem(old.data) };
        return updateItem(old);
      });
    },

    onSettled: (_data, _err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      }
    },
  });
}

// ─── Save / Unsave Mutation ─────────────────────────────────────────────────────
export function useSaveToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isSaved }) =>
      isSaved ? postsApi.unsavePost(postId) : postsApi.savePost(postId),

    onMutate: async ({ postId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      queryClient.setQueriesData({ queryKey: postKeys.all }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            updatePostInPage(page, postId, (p) => ({
              ...p,
              is_saved: !isSaved,
            }))
          ),
        };
      });

      // Update single post detail cache if open
      queryClient.setQueryData(postKeys.detail(postId), (old) => {
        if (!old) return old;
        const updateItem = (p) => ({ ...p, is_saved: !isSaved });
        if (old.data) return { ...old, data: updateItem(old.data) };
        return updateItem(old);
      });
    },

    onSettled: (_data, _err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      }
    },
  });
}

// ─── Delete Post Mutation ───────────────────────────────────────────────────────
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }) => postsApi.deletePost(postId),

    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      queryClient.setQueriesData({ queryKey: postKeys.all }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => removePostFromPage(page, postId)),
        };
      });
    },

    onError: () => {
      toast.error("Không thể xóa bài viết. Vui lòng thử lại.");
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },

    onSuccess: () => {
      toast.success("Đã xóa bài viết thành công!");
    },
  });
}

// ─── Reply Mutation ─────────────────────────────────────────────────────────────
export function useReplyPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentPostId, content, media_urls = [], reply_permission = "everyone" }) =>
      postsApi.replyToPost(parentPostId, { content, media_urls, reply_permission }),

    onSuccess: (_data, { parentPostId }) => {
      // Increment reply count optimistically in cache
      queryClient.setQueriesData({ queryKey: postKeys.all }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            updatePostInPage(page, parentPostId, (p) => ({
              ...p,
              replies_count: (p.replies_count || 0) + 1,
            }))
          ),
        };
      });
      // Invalidate both single post detail and replies list for that post
      queryClient.invalidateQueries({ queryKey: postKeys.detail(parentPostId) });
      queryClient.invalidateQueries({ queryKey: postKeys.replies(parentPostId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Đã đăng câu trả lời!");
    },

    onError: () => {
      toast.error("Không thể gửi câu trả lời. Vui lòng thử lại.");
    },
  });
}

// ─── Quote Mutation ─────────────────────────────────────────────────────────────
export function useQuotePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ originalPostId, content, media_urls = [], reply_permission = "everyone" }) =>
      postsApi.quotePost(originalPostId, { content, media_urls, reply_permission }),

    onSuccess: (resData, { originalPostId }) => {
      // 1. Optimistically increment reposts_and_quotes_count in feed cache
      queryClient.setQueriesData({ queryKey: postKeys.all }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            updatePostInPage(page, originalPostId, (p) => ({
              ...p,
              reposts_and_quotes_count: (p.reposts_and_quotes_count || 0) + 1,
            }))
          ),
        };
      });

      // 2. Increment in single post detail if open
      if (originalPostId) {
        queryClient.setQueryData(postKeys.detail(originalPostId), (old) => {
          if (!old) return old;
          const updateItem = (p) => ({
            ...p,
            reposts_and_quotes_count: (p.reposts_and_quotes_count || 0) + 1,
          });
          if (old.data) return { ...old, data: updateItem(old.data) };
          return updateItem(old);
        });
        queryClient.invalidateQueries({ queryKey: postKeys.detail(originalPostId) });
      }

      // 3. Prepend newly created quote to the active feed page if returned
      const newPost = resData?.data || (resData?.id ? resData : null);
      if (newPost) {
        queryClient.setQueriesData({ queryKey: ["posts", "feed"] }, (old) => {
          if (!old?.pages?.length) return old;
          const firstPage = old.pages[0];
          let updatedFirstPage = firstPage;
          if (Array.isArray(firstPage?.data?.data)) {
            updatedFirstPage = {
              ...firstPage,
              data: {
                ...firstPage.data,
                data: [newPost, ...firstPage.data.data],
              },
            };
          } else if (Array.isArray(firstPage?.data)) {
            updatedFirstPage = {
              ...firstPage,
              data: [newPost, ...firstPage.data],
            };
          }
          return {
            ...old,
            pages: [updatedFirstPage, ...old.pages.slice(1)],
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Đã đăng trích dẫn bài viết!");
    },

    onError: () => {
      toast.error("Không thể trích dẫn bài viết. Vui lòng thử lại.");
    },
  });
}

// ─── Create Post Mutation ───────────────────────────────────────────────────────
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => postsApi.createPost(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Đã đăng bài viết!");
    },

    onError: () => {
      toast.error("Không thể đăng bài viết. Vui lòng thử lại.");
    },
  });
}

// ─── Edit Post Mutation ─────────────────────────────────────────────────────────
export function useEditPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }) => postsApi.editPost(postId, { content }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Đã cập nhật bài viết!");
    },

    onError: () => {
      toast.error("Không thể cập nhật bài viết. Vui lòng thử lại.");
    },
  });
}

// ─── Follow / Unfollow Mutation ─────────────────────────────────────────────────
export function useFollowToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isFollowed }) =>
      isFollowed ? postsApi.unfollowUser(userId) : postsApi.followUser(userId),

    onSuccess: (_data, { isFollowed }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success(isFollowed ? "Đã hủy theo dõi người dùng." : "Đã theo dõi người dùng!");
    },

    onError: () => {
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    },
  });
}

// ─── Update Profile Mutation ────────────────────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => postsApi.updateProfile(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Đã cập nhật thông tin cá nhân thành công!");
    },

    onError: () => {
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    },
  });
}

// ─── User Posts Query ───────────────────────────────────────────────────────────
export function useUserPosts(username, userId) {
  return useInfiniteQuery({
    queryKey: postKeys.userPosts(username || userId),
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getUserPosts({ username, userId, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (pagination) {
        const currentPage = pagination.current_page ?? 1;
        const lastPageNum = pagination.last_page ?? 1;
        return currentPage < lastPageNum ? currentPage + 1 : undefined;
      }
      return undefined;
    },
    enabled: Boolean(username || userId),
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
/**
 * Update a post within a paginated page structure.
 * Handles both { data: [ ...posts ] } and { data: { data: [ ...posts ] } }
 */
function updatePostInPage(page, postId, updater) {
  // Try to find posts array in various response shapes
  const posts = extractPosts(page);
  if (!posts) return page;

  const updated = posts.map((p) => (p.id === postId ? updater(p) : p));
  return injectPosts(page, updated);
}

function removePostFromPage(page, postId) {
  const posts = extractPosts(page);
  if (!posts) return page;
  return injectPosts(page, posts.filter((p) => p.id !== postId));
}

function extractPosts(page) {
  // Shape: { success: true, data: { data: [...] } }  (paginated)
  if (Array.isArray(page?.data?.data)) return page.data.data;
  // Shape: { success: true, data: [ ...posts ] }  (simple array)
  if (Array.isArray(page?.data)) return page.data;
  // Shape: [ ...posts ] (bare array)
  if (Array.isArray(page)) return page;
  return null;
}

function injectPosts(page, posts) {
  if (Array.isArray(page?.data?.data))
    return { ...page, data: { ...page.data, data: posts } };
  if (Array.isArray(page?.data)) return { ...page, data: posts };
  if (Array.isArray(page)) return posts;
  return page;
}
