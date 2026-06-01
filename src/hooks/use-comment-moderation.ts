import { useState, useCallback, useEffect, useRef } from "react";

// Toxicity categories detected by AI
export type ToxicityCategory =
  | "hate_speech"
  | "slur"
  | "spam"
  | "scam_link"
  | "competitor_bait"
  | "harassment"
  | "explicit"
  | "safe";

export interface ModerationComment {
  id: string;
  username: string;
  avatarColor: string;
  comment: string;
  postId: string;
  timestamp: string;
  status: "kept" | "hidden" | "pending";
  toxicityCategory: ToxicityCategory;
  confidenceScore: number; // 0-1
  reason?: string;
}

export interface ModerationStats {
  totalScanned: number;
  totalHidden: number;
  totalKept: number;
  hiddenToday: number;
  keptToday: number;
  topCategories: { category: ToxicityCategory; count: number }[];
  averageResponseTime: number; // ms
}

export interface ModerationSettings {
  isEnabled: boolean;
  autoHideThreshold: number; // confidence above this = auto-hide (0.0-1.0)
  categories: Record<ToxicityCategory, boolean>; // which categories to moderate
  whitelistedUsers: string[];
  notifyOnHide: boolean;
  allowAppeals: boolean;
  hinglishDetection: boolean;
  regionalSlurDetection: boolean;
}

const DEFAULT_SETTINGS: ModerationSettings = {
  isEnabled: false,
  autoHideThreshold: 0.75,
  categories: {
    hate_speech: true,
    slur: true,
    spam: true,
    scam_link: true,
    competitor_bait: true,
    harassment: true,
    explicit: true,
    safe: false,
  },
  whitelistedUsers: [],
  notifyOnHide: true,
  allowAppeals: false,
  hinglishDetection: true,
  regionalSlurDetection: true,
};

// Simulated demo comments that arrive in real-time
const DEMO_COMMENTS: Omit<ModerationComment, "id" | "timestamp" | "status">[] = [
  { username: "sarah.studio", avatarColor: "from-rose-500 to-pink-600", comment: "Love this drop 💕", postId: "p1", toxicityCategory: "safe", confidenceScore: 0.98 },
  { username: "arjun.vibes", avatarColor: "from-green-500 to-emerald-600", comment: "🔥🔥🔥 underrated", postId: "p1", toxicityCategory: "safe", confidenceScore: 0.96 },
  { username: "h8r_42", avatarColor: "from-slate-600 to-slate-700", comment: "You're trash, unfollow everyone 💀", postId: "p1", toxicityCategory: "hate_speech", confidenceScore: 0.94, reason: "Abusive language targeting creator" },
  { username: "priya.r", avatarColor: "from-cyan-500 to-teal-600", comment: "where can i buy this?", postId: "p1", toxicityCategory: "safe", confidenceScore: 0.99 },
  { username: "cash_link99", avatarColor: "from-slate-600 to-slate-700", comment: "Make ₹50K daily! Click bio link 🤑🤑", postId: "p1", toxicityCategory: "scam_link", confidenceScore: 0.97, reason: "Scam/money scheme spam" },
  { username: "foodie_raj", avatarColor: "from-amber-500 to-orange-600", comment: "Recipe please!! 🙏", postId: "p2", toxicityCategory: "safe", confidenceScore: 0.99 },
  { username: "troll_master_x", avatarColor: "from-slate-600 to-slate-700", comment: "bc ye kya bakwas hai lol", postId: "p2", toxicityCategory: "slur", confidenceScore: 0.88, reason: "Hinglish abusive slur detected" },
  { username: "neha.creates", avatarColor: "from-purple-500 to-violet-600", comment: "This is so aesthetic! 😍", postId: "p2", toxicityCategory: "safe", confidenceScore: 0.97 },
  { username: "spam_bot_2024", avatarColor: "from-slate-600 to-slate-700", comment: "Follow @cheapfollowers for 10K followers FREE!!!", postId: "p1", toxicityCategory: "spam", confidenceScore: 0.99, reason: "Follower spam / bot pattern" },
  { username: "travel_with_sam", avatarColor: "from-blue-500 to-indigo-600", comment: "Which city is this? 🌍", postId: "p2", toxicityCategory: "safe", confidenceScore: 0.98 },
  { username: "hater_69_xx", avatarColor: "from-slate-600 to-slate-700", comment: "Use @competitorApp instead, way better product", postId: "p1", toxicityCategory: "competitor_bait", confidenceScore: 0.82, reason: "Competitor promotion detected" },
  { username: "wellness_mama", avatarColor: "from-pink-500 to-rose-600", comment: "Saved this for later! 💚", postId: "p2", toxicityCategory: "safe", confidenceScore: 0.99 },
  { username: "abuser_anon", avatarColor: "from-slate-600 to-slate-700", comment: "Nobody cares about your ugly face 🤢", postId: "p1", toxicityCategory: "harassment", confidenceScore: 0.92, reason: "Personal appearance harassment" },
  { username: "music_vibes_01", avatarColor: "from-indigo-500 to-blue-600", comment: "Song name? 🎶", postId: "p2", toxicityCategory: "safe", confidenceScore: 0.99 },
  { username: "crypto_grind", avatarColor: "from-slate-600 to-slate-700", comment: "DM me for investment opportunity 📈💰 guaranteed returns", postId: "p1", toxicityCategory: "scam_link", confidenceScore: 0.95, reason: "Financial scam / crypto spam" },
];

export function useCommentModeration() {
  const [settings, setSettings] = useState<ModerationSettings>(DEFAULT_SETTINGS);
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    totalScanned: 0,
    totalHidden: 0,
    totalKept: 0,
    hiddenToday: 0,
    keptToday: 0,
    topCategories: [],
    averageResponseTime: 0,
  });
  const [isScanning, setIsScanning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const commentIndexRef = useRef(0);

  // Classify a comment based on settings
  const classifyComment = useCallback(
    (comment: Omit<ModerationComment, "id" | "timestamp" | "status">): "kept" | "hidden" => {
      if (!settings.isEnabled) return "kept";
      if (settings.whitelistedUsers.includes(comment.username)) return "kept";
      if (comment.toxicityCategory === "safe") return "kept";
      if (!settings.categories[comment.toxicityCategory]) return "kept";
      if (comment.confidenceScore >= settings.autoHideThreshold) return "hidden";
      return "kept";
    },
    [settings]
  );

  // Add a new comment to the feed (simulates real-time scanning)
  const processNewComment = useCallback(() => {
    const idx = commentIndexRef.current % DEMO_COMMENTS.length;
    const rawComment = DEMO_COMMENTS[idx];
    commentIndexRef.current++;

    const status = classifyComment(rawComment);
    const newComment: ModerationComment = {
      ...rawComment,
      id: `mod-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString(),
      status,
    };

    setComments((prev) => [newComment, ...prev].slice(0, 50)); // keep last 50

    setStats((prev) => {
      const newHidden = status === "hidden" ? prev.totalHidden + 1 : prev.totalHidden;
      const newKept = status === "kept" ? prev.totalKept + 1 : prev.totalKept;
      const hiddenToday = status === "hidden" ? prev.hiddenToday + 1 : prev.hiddenToday;
      const keptToday = status === "kept" ? prev.keptToday + 1 : prev.keptToday;

      // Update category counts
      const existingCat = prev.topCategories.find((c) => c.category === rawComment.toxicityCategory);
      let topCategories: { category: ToxicityCategory; count: number }[];
      if (existingCat) {
        topCategories = prev.topCategories.map((c) =>
          c.category === rawComment.toxicityCategory ? { ...c, count: c.count + 1 } : c
        );
      } else {
        topCategories = [...prev.topCategories, { category: rawComment.toxicityCategory, count: 1 }];
      }
      topCategories.sort((a, b) => b.count - a.count);

      return {
        totalScanned: prev.totalScanned + 1,
        totalHidden: newHidden,
        totalKept: newKept,
        hiddenToday,
        keptToday,
        topCategories: topCategories.slice(0, 5),
        averageResponseTime: Math.floor(Math.random() * 80) + 20, // 20-100ms
      };
    });
  }, [classifyComment]);

  // Toggle AI moderation on/off
  const toggleModeration = useCallback(() => {
    setSettings((prev) => {
      const newEnabled = !prev.isEnabled;
      if (newEnabled) {
        setIsScanning(true);
      } else {
        setIsScanning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      return { ...prev, isEnabled: newEnabled };
    });
  }, []);

  // Start real-time scanning simulation when enabled
  useEffect(() => {
    if (settings.isEnabled && isScanning) {
      // Process first comment immediately
      processNewComment();

      // Then process at intervals (every 3-6s for realistic feel)
      intervalRef.current = setInterval(() => {
        processNewComment();
      }, 3500 + Math.random() * 2500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [settings.isEnabled, isScanning, processNewComment]);

  // Manually override a comment status
  const overrideComment = useCallback((commentId: string, newStatus: "kept" | "hidden") => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
    );
    setStats((prev) => {
      if (newStatus === "hidden") {
        return { ...prev, totalHidden: prev.totalHidden + 1, totalKept: prev.totalKept - 1, hiddenToday: prev.hiddenToday + 1, keptToday: prev.keptToday - 1 };
      }
      return { ...prev, totalHidden: prev.totalHidden - 1, totalKept: prev.totalKept + 1, hiddenToday: prev.hiddenToday - 1, keptToday: prev.keptToday + 1 };
    });
  }, []);

  // Update moderation settings
  const updateSettings = useCallback((updates: Partial<ModerationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update category toggle
  const toggleCategory = useCallback((category: ToxicityCategory) => {
    setSettings((prev) => ({
      ...prev,
      categories: { ...prev.categories, [category]: !prev.categories[category] },
    }));
  }, []);

  // Add user to whitelist
  const addWhitelistedUser = useCallback((username: string) => {
    setSettings((prev) => ({
      ...prev,
      whitelistedUsers: [...prev.whitelistedUsers, username],
    }));
  }, []);

  // Remove user from whitelist
  const removeWhitelistedUser = useCallback((username: string) => {
    setSettings((prev) => ({
      ...prev,
      whitelistedUsers: prev.whitelistedUsers.filter((u) => u !== username),
    }));
  }, []);

  return {
    settings,
    comments,
    stats,
    isScanning,
    toggleModeration,
    overrideComment,
    updateSettings,
    toggleCategory,
    addWhitelistedUser,
    removeWhitelistedUser,
  };
}
