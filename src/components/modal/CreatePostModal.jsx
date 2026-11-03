import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  X,
  Image as ImageIcon,
  Ghost,
  Loader2,
  Globe,
} from "lucide-react";
import GiphyPicker from "@/components/common/GiphyPicker";

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmitPost,
  isSubmitting = false,
}) {
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.auth);
  const [content, setContent] = useState("");
  const [isGhost, setIsGhost] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaInput, setMediaInput] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentUsername = currentUser?.username || "you";

  const handleSelectGif = ({ file, url }) => {
    if (file) {
      setMediaFiles((prev) => [...prev, file]);
    } else {
      setMediaUrls((prev) => [...prev, url]);
    }
    setMediaPreviews((prev) => [
      ...prev,
      { file, url, type: "image", isGif: true },
    ]);
    setShowGifPicker(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setMediaFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddMediaUrl = () => {
    if (!mediaInput.trim()) return;
    setMediaUrls((prev) => [...prev, mediaInput.trim()]);
    setMediaPreviews((prev) => [
      ...prev,
      { file: null, url: mediaInput.trim(), type: "image" },
    ]);
    setMediaInput("");
    setShowMediaInput(false);
  };

  const handleRemovePreview = (index) => {
    setMediaPreviews((prev) => {
      const item = prev[index];
      if (item?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((_, i) => i !== index);
    });
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    const hasMedia = mediaFiles.length > 0 || mediaUrls.length > 0;
    if ((!content.trim() && !hasMedia) || isSubmitting) return;

    if (onSubmitPost) {
      onSubmitPost({
        content: content.trim(),
        is_ghost: isGhost,
        mediaFiles,
        media_urls: mediaUrls,
      });
    }

    setContent("");
    setMediaFiles([]);
    setMediaPreviews([]);
    setMediaUrls([]);
    setIsGhost(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <h3 className="font-bold text-sm text-[var(--foreground)]">
            {isGhost ? t("feed.newGhostPost") : t("feed.newPost")}
          </h3>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            aria-label={t("common.close")}
            className="p-1 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-xs text-[var(--foreground)] overflow-hidden shrink-0 border border-[var(--border)]">
              {currentUser?.avatar_url || currentUser?.avatar ? (
                <img
                  src={currentUser.avatar_url || currentUser.avatar}
                  alt={currentUsername}
                  className="w-full h-full object-cover"
                />
              ) : (
                (currentUsername[0] || "U").toUpperCase()
              )}
            </div>

            {/* Input area */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-semibold text-xs text-[var(--foreground)]">
                  {currentUsername}
                </span>
                {isGhost && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Ghost size={11} /> {t("feed.anonymous")}
                  </span>
                )}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("feed.whatsNew")}
                disabled={isSubmitting}
                rows={4}
                className="w-full bg-transparent border-0 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-0 focus:outline-none resize-none"
                autoFocus
              />

              {/* Media Previews */}
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 my-2">
                  {mediaPreviews.map((item, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-[var(--border)] group">
                      {item.type === "video" ? (
                        <video src={item.url} controls className="w-full h-32 object-cover" />
                      ) : (
                        <img src={item.url} alt={`Media ${idx + 1}`} className="w-full h-32 object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePreview(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Media URL Input row */}
              {showMediaInput && (
                <div className="flex gap-2 my-2">
                  <input
                    type="url"
                    value={mediaInput}
                    onChange={(e) => setMediaInput(e.target.value)}
                    placeholder={t("feed.pasteImageUrl")}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMediaUrl())}
                  />
                  <button
                    type="button"
                    onClick={handleAddMediaUrl}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent)] hover:opacity-80 cursor-pointer"
                  >
                    {t("feed.add")}
                  </button>
                </div>
              )}

              {/* GIPHY Picker Panel */}
              {showGifPicker && (
                <GiphyPicker
                  onSelectGif={handleSelectGif}
                  onClose={() => setShowGifPicker(false)}
                />
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Action Toolbar */}
              <div className="flex items-center gap-2.5 pt-2 text-[var(--muted-foreground)]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={t("feed.uploadMedia")}
                  className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGifPicker(!showGifPicker);
                    setShowMediaInput(false);
                  }}
                  title={t("feed.selectGif")}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer border ${
                    showGifPicker
                      ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                      : "border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  GIF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(!showMediaInput);
                    setShowGifPicker(false);
                  }}
                  title={t("feed.pasteImageLink")}
                  className={`p-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    showMediaInput
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setIsGhost(!isGhost)}
                  title={isGhost ? t("feed.turnOffGhost") : t("feed.turnOnGhost")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isGhost
                      ? "text-purple-400 bg-purple-500/10 font-bold"
                      : "hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  <Ghost size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Globe size={13} />
            <span>{t("feed.anyoneCanReply")}</span>
          </div>

          <button
            type="button"
            disabled={(!content.trim() && mediaFiles.length === 0 && mediaUrls.length === 0) || isSubmitting}
            onClick={handlePost}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{t("feed.posting")}</span>
              </>
            ) : (
              <span>{t("feed.post")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
