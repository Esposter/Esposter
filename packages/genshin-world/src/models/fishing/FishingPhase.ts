// Where a cast stands: the lure drifting out, the fish biting or nibbling, the reel's tension held against the fish, and
// Its end, the fish caught or got away
export const FishingPhase = {
  Aiming: "Aiming",
  Biting: "Biting",
  Caught: "Caught",
  Lost: "Lost",
  Reeling: "Reeling",
  Waiting: "Waiting",
} as const;
export type FishingPhase = (typeof FishingPhase)[keyof typeof FishingPhase];
