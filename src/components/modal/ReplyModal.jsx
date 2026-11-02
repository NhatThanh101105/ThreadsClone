import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Image as ImageIcon,
  Film,
  Smile,
  BarChart2,
  MapPin,
  X,
  Globe,
  Hash,
  PlusCircle,
  Loader2,
  Users,
  AtSign,
} from "lucide-react";
import { toast } from "sonner";

const POPULAR_EMOJIS = ["❤️", "🔥", "😂", "👍", "👏", "🎉", "🚀", "💯", "✨", "🥳", "💡", "😢", "😍", "🙌"];

const SAMPLE_GIFS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpdGcxMmZwa3c2OTZpdGcxMmZwa3c2OTZpdGcxMmZwa3c2OSZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/3o7TKSjRrfIPjeiVyM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpdGcxMmZwa3c2OTZpdGcxMmZwa3c2OTZpdGcxMmZwa3c2OSZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpdGcxMmZwa3c2OTZpdGcxMmZwa3c2OTZpdGcxMmZwa3c2OSZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/26u4cqiYI30juCOGY/giphy.gif",
];

export default function ReplyModal({
  isOpen,
  onClose,
  targetPost,
  post,
  onSubmitReply,
  onSubmit,
  isSubmitting = false,
}) {
  const activePost = targetPost || post;
  const submitHandler = onSubmitReply || onSubmit;
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.auth);

  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);

  // Active toolbar mini-panels
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [showLocation, setShowLocation] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [showTopic, setShowTopic] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [replyPermission, setReplyPermission] = useState("everyone"); // everyone | following | mentioned
  const [showPermissionMenu, setShowPermissionMenu] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen || !activePost) return null;

  const currentUsername = currentUser?.username || "you";
  const targetUsername = activePost.user?.username || activePost.user?.name || "user";

  // Handle local file selection for real media upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setMediaFiles((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setMediaUrls((prev) => [...prev, ...urls]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveMedia = (index) => {
    setMediaUrls((prev) => {
      const u = prev[index];
      if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      return prev.filter((_, i) => i !== index);
    });
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
  };

  const handleSelectGif = (gifUrl) => {
    setMediaUrls((prev) => [...prev, gifUrl]);
    setShowGifPicker(false);
  };

  const handlePost = () => {
    if ((!content.trim() && mediaUrls.length === 0 && mediaFiles.length === 0) || isSubmitting) return;

    let finalContent = content.trim();
    if (topicName.trim()) {
      finalContent += ` #${topicName.trim().replace(/^#/, "")}`;
    }
    if (locationName.trim()) {
      finalContent += ` 📍 ${locationName.trim()}`;
    }

    if (submitHandler) {
      submitHandler({
        content: finalContent,
        mediaFiles,
        media_urls: mediaUrls,
        parentPostId: activePost.id,
        targetPostId: activePost.id,
        reply_permission: replyPermission,
      });
    }

    // Reset local states
    setContent("");
    setMediaFiles([]);
    setMediaUrls([]);
    setShowPoll(false);
    setShowLocation(false);
    setShowTopic(false);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <h3 className="font-bold text-sm text-[var(--foreground)]">
            {t("modal.replyTitle")}
          </h3>
          <button
            onClick={onClose}
            type="button"
            aria-label={t("common.close")}
            className="p-1 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Target Post Brief Preview */}
          <div className="flex gap-3 relative">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-xs text-[var(--foreground)] overflow-hidden shrink-0 border border-[var(--border)]">
                {activePost.user?.avatar_url ? (
                  <img
                    src={activePost.user.avatar_url}
                    alt={targetUsername}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (targetUsername[0] || "U").toUpperCase()
                )}
              </div>
              {/* Connecting thread line */}
              <div className="w-0.5 flex-1 bg-[var(--border)] my-1 min-h-[30px]" />
            </div>

            <div className="flex-1 pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-semibold text-xs text-[var(--foreground)]">
                  {targetUsername}
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  • {activePost.created_at ? new Date(activePost.created_at).toLocaleDateString() : "gần đây"}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground)]/80 line-clamp-3 leading-relaxed">
                {activePost.content}
              </p>
            </div>
          </div>

          {/* Current User Reply Form */}
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-xs text-[var(--foreground)] overflow-hidden shrink-0 border border-[var(--border)]">
              {currentUser?.avatar_url || currentUser?.avatar ? (
                <img
                  src={currentUser.avatar_url || currentUser.avatar}
                  alt={currentUsername}
                  className="w-full h-full object-cover"
                />
              ) : (
                (currentUsername[0] || "Y").toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-semibold text-xs text-[var(--foreground)]">
                  {currentUsername}
                </span>
              </div>

              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Trả lời @${targetUsername}...`}
                className="w-full bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none resize-none leading-relaxed"
                autoFocus
              />

              {/* Uploaded Media Previews */}
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 my-2">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-black/10 group">
                      <img src={url} alt={`Media ${idx + 1}`} className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Media URL / GIF Input row */}

              {/* Poll UI (when active) */}
              {showPoll && (
                <div className="p-3 my-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Thăm dò ý kiến</span>
                    <button
                      type="button"
                      onClick={() => setShowPoll(false)}
                      className="text-[var(--muted-foreground)] hover:text-rose-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Lựa chọn ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[idx] = e.target.value;
                        setPollOptions(next);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none"
                    />
                  ))}
                </div>
              )}

              {/* Location Input UI */}
              {showLocation && (
                <div className="flex items-center gap-2 my-2 p-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40">
                  <MapPin size={14} className="text-rose-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Nhập vị trí (ví dụ: Hà Nội, TP.HCM)..."
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-[var(--foreground)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLocationName("");
                      setShowLocation(false);
                    }}
                    className="p-1 hover:text-rose-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Topic Input UI */}
              {showTopic && (
                <div className="flex items-center gap-2 my-2 p-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40">
                  <Hash size={14} className="text-sky-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Thêm chủ đề (ví dụ: react, threads)..."
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-[var(--foreground)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTopicName("");
                      setShowTopic(false);
                    }}
                    className="p-1 hover:text-rose-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Emoji Picker Row */}
              {showEmojiPicker && (
                <div className="flex items-center gap-2 p-2 my-2 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className="text-base p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* GIF Selector Panel */}
              {showGifPicker && (
                <div className="grid grid-cols-3 gap-1.5 p-2 my-2 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                  {SAMPLE_GIFS.map((gif, idx) => (
                    <img
                      key={idx}
                      src={gif}
                      alt={`GIF ${idx + 1}`}
                      onClick={() => handleSelectGif(gif)}
                      className="h-16 w-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Hidden file input for media upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* 5-button Toolbar */}
              <div className="flex items-center gap-1 py-2 text-[var(--muted-foreground)] border-t border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải lên ảnh / video"
                  className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                >
                  <ImageIcon size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowGifPicker(!showGifPicker)}
                  title="GIF"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showGifPicker ? "text-[var(--foreground)] bg-[var(--accent)]" : "hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  <Film size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showEmojiPicker ? "text-[var(--foreground)] bg-[var(--accent)]" : "hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  <Smile size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPoll(!showPoll)}
                  title="Thăm dò ý kiến"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showPoll ? "text-[var(--foreground)] bg-[var(--accent)]" : "hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  <BarChart2 size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocation(!showLocation)}
                  title="Vị trí"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showLocation ? "text-[var(--foreground)] bg-[var(--accent)]" : "hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  <MapPin size={17} />
                </button>
              </div>

              {/* Extras: Add a topic, Add to thread */}
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTopic(!showTopic)}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    <Hash size={13} />
                    <span>{topicName ? `#${topicName}` : t("modal.addTopic")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Đã thêm một bài viết mới vào chuỗi!")}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    <PlusCircle size={13} />
                    <span>{t("modal.addToThread")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border)] relative">
          {/* Reply Permission Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPermissionMenu(!showPermissionMenu)}
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              {replyPermission === "everyone" && <Globe size={13} />}
              {replyPermission === "following" && <Users size={13} />}
              {replyPermission === "mentioned" && <AtSign size={13} />}
              <span>
                {replyPermission === "everyone" && "Bất kỳ ai cũng có thể trả lời"}
                {replyPermission === "following" && "Những người bạn theo dõi"}
                {replyPermission === "mentioned" && "Chỉ những người được nhắc đến"}
              </span>
            </button>

            {/* Dropdown menu */}
            {showPermissionMenu && (
              <div className="absolute bottom-10 left-0 z-30 w-60 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1.5 text-xs backdrop-blur-md animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setReplyPermission("everyone");
                    setShowPermissionMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    replyPermission === "everyone" ? "bg-[var(--accent)] font-bold text-[var(--foreground)]" : "hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <Globe size={14} />
                  <span>Bất kỳ ai có thể trả lời</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyPermission("following");
                    setShowPermissionMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    replyPermission === "following" ? "bg-[var(--accent)] font-bold text-[var(--foreground)]" : "hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <Users size={14} />
                  <span>Những người bạn theo dõi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyPermission("mentioned");
                    setShowPermissionMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    replyPermission === "mentioned" ? "bg-[var(--accent)] font-bold text-[var(--foreground)]" : "hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <AtSign size={14} />
                  <span>Chỉ người được nhắc đến</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={(!content.trim() && mediaUrls.length === 0 && mediaFiles.length === 0) || isSubmitting}
            onClick={handlePost}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {t("modal.post")}
          </button>
        </div>
      </div>
    </div>
  );
}
