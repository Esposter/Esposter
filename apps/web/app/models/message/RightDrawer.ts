export const RightDrawer = {
  Member: "Member",
  Pinned: "Pinned",
  Search: "Search",
  Thread: "Thread",
  Threads: "Threads",
} as const;
export type RightDrawer = (typeof RightDrawer)[keyof typeof RightDrawer];
