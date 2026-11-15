// The Adventurer Handbook's tabs, each a part of the game's progress it tracks
export const HandbookTab = {
  Commissions: "Commissions",
  Domains: "Domains",
  Embattle: "Embattle",
  Enemies: "Enemies",
  Experience: "Experience",
  Guide: "Guide",
} as const;
export type HandbookTab = (typeof HandbookTab)[keyof typeof HandbookTab];
