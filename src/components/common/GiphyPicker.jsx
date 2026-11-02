import { useState, useMemo } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Categorized curated GIPHY GIFs collection
const GIPHY_CATEGORIES = [
  { id: "trending", label: "🔥 Thịnh hành" },
  { id: "funny", label: "😂 Haha" },
  { id: "love", label: "❤️ Thả tim" },
  { id: "cats", label: "🐱 Mèo" },
  { id: "anime", label: "✨ Anime" },
  { id: "crying", label: "😢 Khóc" },
  { id: "applause", label: "👏 Vỗ tay" },
  { id: "wow", label: "😲 Wow" },
  { id: "party", label: "🎉 Tiệc tùng" },
];

const GIPHY_DATABASE = [
  // Trending
  {
    id: "g1",
    tags: ["trending", "happy", "excited"],
    url: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
    title: "Excited Dance",
  },
  {
    id: "g2",
    tags: ["trending", "applause", "leonardo"],
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    title: "Clapping",
  },
  {
    id: "g3",
    tags: ["trending", "party", "dance"],
    url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    title: "Dance Party",
  },
  {
    id: "g4",
    tags: ["trending", "confused", "travolta"],
    url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
    title: "Confused Travolta",
  },
  {
    id: "g5",
    tags: ["trending", "excited", "happy"],
    url: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
    title: "Excited Kid",
  },
  {
    id: "g6",
    tags: ["trending", "cheers", "gatsby"],
    url: "https://media.giphy.com/media/BPJmthQ3YRwD6QqcVD/giphy.gif",
    title: "Gatsby Cheers",
  },

  // Funny
  {
    id: "g7",
    tags: ["funny", "laughing", "haha"],
    url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif",
    title: "Laughing Hard",
  },
  {
    id: "g8",
    tags: ["funny", "cats", "laugh"],
    url: "https://media.giphy.com/media/xT9DPBMumj2Q0hlI3K/giphy.gif",
    title: "Cat Laugh",
  },
  {
    id: "g9",
    tags: ["funny", "haha", "giggle"],
    url: "https://media.giphy.com/media/bC9czlgCMtw4cj8RgH/giphy.gif",
    title: "Giggle",
  },
  {
    id: "g10",
    tags: ["funny", "haha", "chuckle"],
    url: "https://media.giphy.com/media/l1ug3xGEN1oZBT7qw/giphy.gif",
    title: "Laughing Out Loud",
  },

  // Love
  {
    id: "g11",
    tags: ["love", "heart", "cute"],
    url: "https://media.giphy.com/media/M90mJvfWfd5mbUuULX/giphy.gif",
    title: "Heart Eyes",
  },
  {
    id: "g12",
    tags: ["love", "hearts", "sweet"],
    url: "https://media.giphy.com/media/26BRv0ThflsDTqqJa/giphy.gif",
    title: "Love Hearts",
  },
  {
    id: "g13",
    tags: ["love", "cats", "hug"],
    url: "https://media.giphy.com/media/OpfkuToK5FTYQ/giphy.gif",
    title: "Cat Hug",
  },
  {
    id: "g14",
    tags: ["love", "kiss", "heart"],
    url: "https://media.giphy.com/media/c76IJLufpNwSULPk77/giphy.gif",
    title: "Sending Love",
  },

  // Cats
  {
    id: "g15",
    tags: ["cats", "cat", "typing", "work"],
    url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    title: "Typing Cat",
  },
  {
    id: "g16",
    tags: ["cats", "cat", "vibing", "dance"],
    url: "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",
    title: "Vibing Cat",
  },
  {
    id: "g17",
    tags: ["cats", "cat", "surprised"],
    url: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
    title: "Surprised Cat",
  },
  {
    id: "g18",
    tags: ["cats", "cat", "cute"],
    url: "https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif",
    title: "Cute Kitty",
  },

  // Anime
  {
    id: "g19",
    tags: ["anime", "wow", "sparkle"],
    url: "https://media.giphy.com/media/11ISwbgGL28ZjFA/giphy.gif",
    title: "Anime Wow",
  },
  {
    id: "g20",
    tags: ["anime", "anya", "spyxfamily", "cute"],
    url: "https://media.giphy.com/media/L3ERvA6jWCd0qO4NdX/giphy.gif",
    title: "Anya Smile",
  },
  {
    id: "g21",
    tags: ["anime", "chika", "dance"],
    url: "https://media.giphy.com/media/eYq9JKc20xXXEdOTnj/giphy.gif",
    title: "Chika Dance",
  },
  {
    id: "g22",
    tags: ["anime", "applause", "clapping"],
    url: "https://media.giphy.com/media/8UGD5dEe4ezIo79UMx/giphy.gif",
    title: "Anime Clap",
  },

  // Crying
  {
    id: "g23",
    tags: ["crying", "sad", "tears"],
    url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",
    title: "Crying Sad",
  },
  {
    id: "g24",
    tags: ["crying", "sad", "tears"],
    url: "https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif",
    title: "Tears",
  },
  {
    id: "g25",
    tags: ["crying", "spongebob", "sad"],
    url: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
    title: "Spongebob Crying",
  },

  // Applause
  {
    id: "g26",
    tags: ["applause", "clapping", "leonardo"],
    url: "https://media.giphy.com/media/nbvFVPiEiJH6JOGIok/giphy.gif",
    title: "Clapping Leonardo",
  },
  {
    id: "g27",
    tags: ["applause", "bravo", "standing"],
    url: "https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif",
    title: "Standing Ovation",
  },
  {
    id: "g28",
    tags: ["applause", "clapping"],
    url: "https://media.giphy.com/media/fnK0jeA8vIh2QLq3IZ/giphy.gif",
    title: "Applause",
  },

  // Wow
  {
    id: "g29",
    tags: ["wow", "mindblown", "shocked"],
    url: "https://media.giphy.com/media/tfUW8mhiFk8NlRezUS/giphy.gif",
    title: "Mind Blown",
  },
  {
    id: "g30",
    tags: ["wow", "chrispratt", "shocked"],
    url: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif",
    title: "Chris Pratt Wow",
  },
  {
    id: "g31",
    tags: ["wow", "surprised"],
    url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
    title: "Surprised",
  },

  // Party
  {
    id: "g32",
    tags: ["party", "dance", "celebrate"],
    url: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif",
    title: "Party Dance",
  },
  {
    id: "g33",
    tags: ["party", "celebration", "confetti"],
    url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
    title: "Celebration",
  },
];

export default function GiphyPicker({ onSelectGif, onClose }) {
  const [activeCategory, setActiveCategory] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingGif, setIsLoadingGif] = useState(false);
  const [customGifUrl, setCustomGifUrl] = useState("");

  const filteredGifs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return GIPHY_DATABASE.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeCategory === "trending") {
      return GIPHY_DATABASE;
    }
    return GIPHY_DATABASE.filter((g) => g.tags.includes(activeCategory));
  }, [searchQuery, activeCategory]);

  const handlePickGif = async (gifUrl) => {
    setIsLoadingGif(true);
    try {
      // Fetch GIF as blob and convert to File so it uploads seamlessly to backend
      const res = await fetch(gifUrl);
      const blob = await res.blob();
      const filename = `giphy_${Math.floor(Math.random() * 1000000)}.gif`;
      const gifFile = new File([blob], filename, { type: "image/gif" });

      if (onSelectGif) {
        onSelectGif({ file: gifFile, url: gifUrl });
      }
      toast.success("Đã đính kèm ảnh GIF từ GIPHY!");
      if (onClose) onClose();
    } catch (_err) {
      // Fallback: pass url if fetch blob blocked
      if (onSelectGif) {
        onSelectGif({ file: null, url: gifUrl });
      }
      if (onClose) onClose();
    } finally {
      setIsLoadingGif(false);
    }
  };

  const handleCustomGifSubmit = (e) => {
    e.preventDefault();
    if (!customGifUrl.trim()) return;
    handlePickGif(customGifUrl.trim());
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 my-2 shadow-xl animate-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-linear-to-r from-pink-500 to-indigo-500 text-white font-black text-[11px] tracking-wider uppercase">
            GIPHY
          </span>
          <span className="text-xs font-semibold text-[var(--foreground)]">
            Chọn ảnh GIF
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm GIF trên GIPHY (vui vẻ, mèo, anime...)"
          className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      {!searchQuery && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2">
          {GIPHY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] font-semibold"
                    : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading overlay */}
      {isLoadingGif && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--foreground)] animate-pulse">
          <Loader2 size={16} className="animate-spin text-pink-500" />
          <span>Đang đính kèm GIF...</span>
        </div>
      )}

      {/* GIF Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
        {filteredGifs.length === 0 ? (
          <div className="col-span-full text-center py-6 text-xs text-[var(--muted-foreground)]">
            Không tìm thấy GIF phù hợp với "{searchQuery}"
          </div>
        ) : (
          filteredGifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              onClick={() => handlePickGif(gif.url)}
              disabled={isLoadingGif}
              className="relative aspect-4/3 rounded-xl overflow-hidden border border-[var(--border)] group hover:scale-[1.02] hover:border-[var(--foreground)]/50 transition-all cursor-pointer bg-black/10 focus:outline-none"
            >
              <img
                src={gif.url}
                alt={gif.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <span className="text-[10px] text-white font-medium truncate">
                  {gif.title}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Direct GIPHY Link Input fallback */}
      <form onSubmit={handleCustomGifSubmit} className="mt-2 pt-2 border-t border-[var(--border)] flex gap-1.5">
        <input
          type="url"
          value={customGifUrl}
          onChange={(e) => setCustomGifUrl(e.target.value)}
          placeholder="Hoặc dán link GIF trực tiếp (https://media.giphy.com/...)"
          className="flex-1 px-2.5 py-1 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[11px] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!customGifUrl.trim()}
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--accent)] text-[var(--foreground)] hover:opacity-80 disabled:opacity-40 cursor-pointer"
        >
          Dán GIF
        </button>
      </form>
    </div>
  );
}

