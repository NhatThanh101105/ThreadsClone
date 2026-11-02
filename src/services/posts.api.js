import apiClient from "@/lib/axios";

/**
 * Posts API Service - Phase 2
 * All endpoints for feed, interactions, create/delete, reply, quote, repost
 */
export const postsApi = {
  /**
   * Get paginated feed posts (public endpoint)
   * GET /api/posts/feed?page=1
   * Response: { success, data: [...posts], pagination: { current_page, last_page, ... } }
   */
  getFeed: async ({ page = 1, type = "for_you" } = {}) => {
    const params = { page };
    if (type && type !== "for_you") {
      params.type = type;
    }
    const response = await apiClient.get("/api/posts/feed", {
      params,
    });
    return response.data;
  },

  /**
   * Get a single post by ID
   * @param {number|string} postId
   */
  getPost: async (postId) => {
    const response = await apiClient.get(`/api/posts/${postId}`);
    return response.data;
  },

  /**
   * Create a new post
   * @param {{ content: string, parent_id?: number, original_post_id?: number, is_quote?: boolean, is_ghost?: boolean, media_urls?: string[], mediaFiles?: File[], reply_permission?: string }} data
   */
  createPost: async (data) => {
    if (data instanceof FormData) {
      const response = await apiClient.post("/api/posts", data);
      return response.data;
    }

    if (data?.mediaFiles && data.mediaFiles.length > 0) {
      const formData = new FormData();
      if (data.content !== undefined) formData.append("content", data.content);
      if (data.is_ghost !== undefined) formData.append("is_ghost", data.is_ghost ? "1" : "0");
      if (data.reply_permission) formData.append("reply_permission", data.reply_permission);
      if (data.parent_id) formData.append("parent_id", data.parent_id);
      if (data.original_post_id) formData.append("original_post_id", data.original_post_id);
      data.mediaFiles.forEach((file) => formData.append("media[]", file));
      const response = await apiClient.post("/api/posts", formData);
      return response.data;
    }

    const response = await apiClient.post("/api/posts", data);
    return response.data;
  },

  /**
   * Delete a post by ID
   * @param {number|string} postId
   */
  deletePost: async (postId) => {
    const response = await apiClient.delete(`/api/posts/${postId}`);
    return response.data;
  },

  /**
   * Like a post
   * @param {number|string} postId
   */
  likePost: async (postId) => {
    const response = await apiClient.post(`/api/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Unlike a post
   * @param {number|string} postId
   */
  unlikePost: async (postId) => {
    const response = await apiClient.delete(`/api/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Repost a post
   * @param {number|string} postId
   */
  repostPost: async (postId) => {
    const response = await apiClient.post(`/api/posts/${postId}/repost`);
    return response.data;
  },

  /**
   * Un-repost a post
   * @param {number|string} postId
   */
  unrepostPost: async (postId) => {
    const response = await apiClient.delete(`/api/posts/${postId}/repost`);
    return response.data;
  },

  /**
   * Save (bookmark) a post
   * @param {number|string} postId
   */
  savePost: async (postId) => {
    const response = await apiClient.post(`/api/posts/${postId}/save`);
    return response.data;
  },

  /**
   * Unsave (remove bookmark) a post
   * @param {number|string} postId
   */
  unsavePost: async (postId) => {
    const response = await apiClient.delete(`/api/posts/${postId}/save`);
    return response.data;
  },

  /**
   * Upload media file(s) (image / video)
   * @param {File|File[]|FileList} fileOrFiles
   */
  uploadMedia: async (fileOrFiles) => {
    const formData = new FormData();
    if (Array.isArray(fileOrFiles)) {
      fileOrFiles.forEach((file) => formData.append("media[]", file));
    } else if (typeof FileList !== "undefined" && fileOrFiles instanceof FileList) {
      Array.from(fileOrFiles).forEach((file) => formData.append("media[]", file));
    } else {
      formData.append("media[]", fileOrFiles);
    }
    const response = await apiClient.post("/api/upload/media", formData);
    return response.data;
  },

  /**
   * Edit/Update an existing post
   * @param {number|string} postId
   * @param {{ content: string }} data
   */
  editPost: async (postId, data) => {
    const response = await apiClient.put(`/api/posts/${postId}`, data);
    return response.data;
  },

  /**
   * Follow a user
   * @param {number|string} userId
   */
  followUser: async (userId) => {
    const response = await apiClient.post(`/api/users/${userId}/follow`);
    return response.data;
  },

  /**
   * Unfollow a user
   * @param {number|string} userId
   */
  unfollowUser: async (userId) => {
    const response = await apiClient.delete(`/api/users/${userId}/follow`);
    return response.data;
  },

  /**
   * Update profile information
   * @param {{ name?: string, bio?: string, avatar_url?: string, avatarFile?: File, is_private?: boolean } | FormData} data
   */
  updateProfile: async (data) => {
    if (data instanceof FormData) {
      const response = await apiClient.post("/api/auth/profile", data);
      return response.data;
    }

    const file = data?.avatarFile || data?.avatar;
    if (file instanceof File || file instanceof Blob) {
      const formData = new FormData();
      formData.append("_method", "PUT");
      if (data.name) formData.append("name", data.name);
      if (data.bio !== undefined) formData.append("bio", data.bio);
      if (data.is_private !== undefined) formData.append("is_private", data.is_private ? "1" : "0");
      formData.append("avatar", file);
      const response = await apiClient.post("/api/auth/profile", formData);
      return response.data;
    }

    const payload = { ...data };
    delete payload.avatarFile;
    const response = await apiClient.put("/api/auth/profile", payload);
    return response.data;
  },

  /**
   * Reply to a post (create a post with parent_id or /reply)
   * @param {number|string} parentPostId
   * @param {{ content: string, media_urls?: string[], mediaFiles?: File[], reply_permission?: string }} data
   */
  replyToPost: async (parentPostId, data) => {
    if (data?.mediaFiles && data.mediaFiles.length > 0) {
      const formData = new FormData();
      if (data.content) formData.append("content", data.content);
      if (data.reply_permission) formData.append("reply_permission", data.reply_permission);
      data.mediaFiles.forEach((file) => formData.append("media[]", file));
      try {
        const response = await apiClient.post(`/api/posts/${parentPostId}/reply`, formData);
        return response.data;
      } catch (_err) {
        formData.append("parent_id", parentPostId);
        const response = await apiClient.post("/api/posts", formData);
        return response.data;
      }
    }

    try {
      const response = await apiClient.post(`/api/posts/${parentPostId}/reply`, data);
      return response.data;
    } catch (_err) {
      // Fallback to /api/posts with parent_id
      const response = await apiClient.post("/api/posts", {
        ...data,
        parent_id: parentPostId,
      });
      return response.data;
    }
  },

  /**
   * Quote a post (create a post with original_post_id or /quote)
   * @param {number|string} originalPostId
   * @param {{ content: string, media_urls?: string[], mediaFiles?: File[], reply_permission?: string }} data
   */
  quotePost: async (originalPostId, data) => {
    if (data?.mediaFiles && data.mediaFiles.length > 0) {
      const formData = new FormData();
      if (data.content) formData.append("content", data.content);
      if (data.reply_permission) formData.append("reply_permission", data.reply_permission);
      data.mediaFiles.forEach((file) => formData.append("media[]", file));
      try {
        const response = await apiClient.post(`/api/posts/${originalPostId}/quote`, formData);
        return response.data;
      } catch (_err) {
        formData.append("original_post_id", originalPostId);
        formData.append("is_quote", "1");
        const response = await apiClient.post("/api/posts", formData);
        return response.data;
      }
    }

    try {
      const response = await apiClient.post(`/api/posts/${originalPostId}/quote`, data);
      return response.data;
    } catch (_err) {
      // Fallback to /api/posts with original_post_id
      const response = await apiClient.post("/api/posts", {
        ...data,
        original_post_id: originalPostId,
        is_quote: true,
      });
      return response.data;
    }
  },

  /**
   * Get replies for a post
   * @param {number|string} postId
   * @param {{ page?: number }} params
   */
  getPostReplies: async (postId, { page = 1 } = {}) => {
    const response = await apiClient.get(`/api/posts/${postId}/replies`, {
      params: { page },
    });
    return response.data;
  },

  /**
   * Search posts
   * @param {{ q: string, page?: number }} params
   */
  searchPosts: async ({ q, page = 1 }) => {
    const response = await apiClient.get("/api/posts/search", {
      params: { q, page },
    });
    return response.data;
  },

  /**
   * Get posts by user (via feed endpoint with filter)
   * @param {{ username?: string, userId?: number|string, page?: number }} params
   */
  getUserPosts: async ({ username, userId, page = 1 } = {}) => {
    const params = { page };
    if (username) params.user = username;
    if (userId) params.user_id = userId;
    const response = await apiClient.get("/api/posts/feed", {
      params,
    });
    return response.data;
  },
};

export default postsApi;
