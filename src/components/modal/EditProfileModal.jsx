import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Camera, Lock, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
  isSaving = false,
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.username || "");
      setBio(currentUser.bio || "");
      setAvatarUrl(currentUser.avatar_url || currentUser.avatar || "");
      setIsPrivate(Boolean(currentUser.is_private));
      setAvatarFile(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    toast.info(t("profile.editModal.selectedPhotoToast"));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSaving) return;
    onSave({
      name: name.trim(),
      bio: bio.trim(),
      avatarFile,
      avatar_url: avatarUrl,
      is_private: isPrivate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-2xl relative animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <h3 className="font-bold text-base text-[var(--foreground)]">
            {t("profile.editModal.title")}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload Preview */}
          <div className="flex items-center gap-4 py-2">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center font-bold text-lg text-[var(--foreground)] overflow-hidden border border-[var(--border)]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (name[0] || "U").toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                aria-label="Upload Avatar"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-sm text-[var(--foreground)]">
                {t("profile.editModal.avatar")}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[var(--primary)] hover:underline mt-0.5 cursor-pointer font-medium"
              >
                {t("profile.editModal.changeAvatar")}
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
              {t("profile.editModal.nameLabel")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.editModal.namePlaceholder")}
              maxLength={50}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
              {t("profile.editModal.bioLabel")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder={t("profile.editModal.bioPlaceholder")}
              maxLength={160}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
            <span className="block text-[11px] text-right text-[var(--muted-foreground)]">
              {bio.length}/160
            </span>
          </div>

          {/* Private Account Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--accent)]/20">
            <div className="flex items-center gap-2.5">
              {isPrivate ? (
                <Lock size={16} className="text-amber-500" />
              ) : (
                <Globe size={16} className="text-blue-500" />
              )}
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  {t("profile.editModal.privateAccount")}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {isPrivate
                    ? t("profile.editModal.privateDesc")
                    : t("profile.editModal.publicDesc")}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isPrivate}
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isPrivate ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white dark:bg-black transition-transform ${
                  isPrivate ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              {t("profile.editModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              <span>{isSaving ? t("profile.editModal.saving") : t("profile.editModal.save")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

