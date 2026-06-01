import { useState, useCallback, useEffect, useRef } from "react";

// Meta's published rate limits for Instagram DMs
const META_RATE_LIMIT = {
  maxPerMinute: 20, // Conservative: Meta allows ~20 DMs/min for business accounts
  maxPerHour: 200,
  batchSize: 10, // Send in batches of 10
  delayBetweenBatches: 35000, // 35 seconds between batches (safe margin)
};

export interface RetriggerComment {
  id: string;
  username: string;
  comment: string;
  postId: string;
  postCaption: string;
  commentedAt: string;
  matchedKeyword: string;
}

export interface RetriggerStats {
  totalFound: number;
  dmsSent: number;
  dmsQueued: number;
  dmsFailed: number;
  repliesReceived: number;
  batchesSent: number;
  totalBatches: number;
  currentBatchProgress: number;
  isRateLimited: boolean;
  rateLimitResetAt: string | null;
}

export interface RetriggerConfig {
  keywords: string[];
  scanMode: "all_posts" | "recent" | "specific";
  dmMessage: string;
  excludeAlreadySent: boolean;
  maxDmsPerRun: number;
}

export function useRetrigger() {
  const [isActive, setIsActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [comments, setComments] = useState<RetriggerComment[]>([]);
  const [stats, setStats] = useState<RetriggerStats>({
    totalFound: 0,
    dmsSent: 0,
    dmsQueued: 0,
    dmsFailed: 0,
    repliesReceived: 0,
    batchesSent: 0,
    totalBatches: 0,
    currentBatchProgress: 0,
    isRateLimited: false,
    rateLimitResetAt: null,
  });
  const [config, setConfig] = useState<RetriggerConfig>({
    keywords: [],
    scanMode: "recent",
    dmMessage: "",
    excludeAlreadySent: true,
    maxDmsPerRun: 50,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sendingRef = useRef(false);

  // Simulate scanning old comments from posts
  const scanOldComments = useCallback(async () => {
    setIsScanning(true);

    // Simulate API call to fetch old comments matching keywords
    await new Promise((r) => setTimeout(r, 2000));

    const demoComments: RetriggerComment[] = [
      { id: "rc1", username: "fitness_lover_22", comment: "LINK please!", postId: "p1", postCaption: "New workout plan drop...", commentedAt: "2026-04-15T10:30:00Z", matchedKeyword: "LINK" },
      { id: "rc2", username: "sarah.creates", comment: "I need the INFO", postId: "p1", postCaption: "New workout plan drop...", commentedAt: "2026-04-14T08:15:00Z", matchedKeyword: "INFO" },
      { id: "rc3", username: "travel_with_jake", comment: "Link pls", postId: "p2", postCaption: "Free travel guide...", commentedAt: "2026-04-10T14:20:00Z", matchedKeyword: "LINK" },
      { id: "rc4", username: "wellness_warrior", comment: "WANT this!", postId: "p2", postCaption: "Free travel guide...", commentedAt: "2026-04-09T09:00:00Z", matchedKeyword: "WANT" },
      { id: "rc5", username: "digital_nomad_life", comment: "Send me the link!", postId: "p3", postCaption: "Secret to 10k followers...", commentedAt: "2026-03-28T16:45:00Z", matchedKeyword: "LINK" },
      { id: "rc6", username: "mom.boss.empire", comment: "INFO please!!", postId: "p3", postCaption: "Secret to 10k followers...", commentedAt: "2026-03-25T11:30:00Z", matchedKeyword: "INFO" },
      { id: "rc7", username: "photographer_anna", comment: "I WANT it!", postId: "p1", postCaption: "New workout plan drop...", commentedAt: "2026-03-20T07:15:00Z", matchedKeyword: "WANT" },
      { id: "rc8", username: "chef_marco", comment: "Link me!", postId: "p4", postCaption: "Best recipe ebook...", commentedAt: "2026-03-18T13:10:00Z", matchedKeyword: "LINK" },
      { id: "rc9", username: "yoga.with.joy", comment: "PRICE?", postId: "p4", postCaption: "Best recipe ebook...", commentedAt: "2026-03-15T18:00:00Z", matchedKeyword: "PRICE" },
      { id: "rc10", username: "startup_grind_101", comment: "Need the LINK", postId: "p5", postCaption: "My business toolkit...", commentedAt: "2026-03-10T20:30:00Z", matchedKeyword: "LINK" },
      { id: "rc11", username: "bookworm_cafe", comment: "INFO!", postId: "p5", postCaption: "My business toolkit...", commentedAt: "2026-03-08T12:00:00Z", matchedKeyword: "INFO" },
      { id: "rc12", username: "dance_with_nina", comment: "WANT!!", postId: "p2", postCaption: "Free travel guide...", commentedAt: "2026-03-05T15:45:00Z", matchedKeyword: "WANT" },
    ];

    setComments(demoComments);
    setStats((prev) => ({
      ...prev,
      totalFound: demoComments.length,
      dmsQueued: demoComments.length,
      totalBatches: Math.ceil(demoComments.length / META_RATE_LIMIT.batchSize),
    }));
    setIsScanning(false);
  }, [config]);

  // Process DMs in safe batches
  const startSending = useCallback(() => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);

    let sentCount = 0;
    let batchCount = 0;
    const total = comments.length;
    const batchSize = META_RATE_LIMIT.batchSize;
    const totalBatches = Math.ceil(total / batchSize);

    const sendBatch = () => {
      if (sentCount >= total || !sendingRef.current) {
        sendingRef.current = false;
        setIsSending(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const batchEnd = Math.min(sentCount + batchSize, total);
      batchCount++;

      // Simulate sending batch with progress
      let batchProgress = 0;
      const progressInterval = setInterval(() => {
        batchProgress++;
        const itemsInBatch = batchEnd - sentCount;
        if (batchProgress >= itemsInBatch) {
          clearInterval(progressInterval);
          sentCount = batchEnd;

          setStats((prev) => ({
            ...prev,
            dmsSent: sentCount,
            dmsQueued: total - sentCount,
            batchesSent: batchCount,
            totalBatches,
            currentBatchProgress: 100,
            repliesReceived: Math.floor(sentCount * 0.15), // ~15% reply rate simulation
          }));
        } else {
          setStats((prev) => ({
            ...prev,
            currentBatchProgress: Math.round((batchProgress / itemsInBatch) * 100),
          }));
        }
      }, 800);
    };

    // Send first batch immediately
    sendBatch();

    // Schedule subsequent batches with delay (respecting rate limits)
    intervalRef.current = setInterval(sendBatch, META_RATE_LIMIT.delayBetweenBatches);
  }, [comments]);

  // Stop sending
  const stopSending = useCallback(() => {
    sendingRef.current = false;
    setIsSending(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Toggle activation
  const toggleRetrigger = useCallback(async () => {
    if (isActive) {
      stopSending();
      setIsActive(false);
      return;
    }

    setIsActive(true);
    await scanOldComments();
  }, [isActive, stopSending, scanOldComments]);

  // Simulate replies coming in over time
  useEffect(() => {
    if (!isSending && stats.dmsSent > 0) {
      const replyInterval = setInterval(() => {
        setStats((prev) => {
          const maxReplies = Math.floor(prev.dmsSent * 0.25);
          if (prev.repliesReceived >= maxReplies) {
            clearInterval(replyInterval);
            return prev;
          }
          return { ...prev, repliesReceived: prev.repliesReceived + 1 };
        });
      }, 5000);
      return () => clearInterval(replyInterval);
    }
  }, [isSending, stats.dmsSent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isActive,
    isScanning,
    isSending,
    comments,
    stats,
    config,
    setConfig,
    toggleRetrigger,
    startSending,
    stopSending,
    scanOldComments,
    metaRateLimits: META_RATE_LIMIT,
  };
}
