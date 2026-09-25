import raw from "./bangumi.json";

export type BangumiStatus = "watching" | "completed" | "wish" | "onhold" | "dropped";

export interface BangumiItem {
  id: number;
  name: string;
  nameCn: string;
  status: BangumiStatus;
  score: number;
  progress: number;
  total: number;
  date: string;
  cover: string;
  url: string;
}

interface BangumiPayload {
  updatedAt: string;
  user: { uid: string; nickname: string };
  items: BangumiItem[];
}

const payload = raw as BangumiPayload;

export const bangumiData = payload;

const STATUS_ORDER: Record<BangumiStatus, number> = {
  watching: 0,
  completed: 1,
  wish: 2,
  onhold: 3,
  dropped: 4
};

/** 全部收藏，顺序为：在看 → 看过 → 想看 → 搁置 → 抛弃 */
export const bangumiItems: BangumiItem[] = [...(payload.items ?? [])].sort(
  (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.score - a.score || a.id - b.id
);

export const bangumiWatching = bangumiItems.filter((item) => item.status === "watching");

export const bangumiFinished = bangumiItems.filter((item) => item.status !== "watching");

export const bangumiStatusLabel: Record<BangumiStatus, string> = {
  watching: "在看",
  completed: "看过",
  wish: "想看",
  onhold: "搁置",
  dropped: "抛弃"
};

export const bangumiDisplayName = (item: BangumiItem) => item.nameCn || item.name;
