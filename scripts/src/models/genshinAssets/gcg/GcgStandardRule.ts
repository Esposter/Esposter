import type { GcgStandardReaction } from "#src/models/genshinAssets/gcg/GcgStandardReaction";

// The duel rule a slice is written from: how many cards a side draws at each end phase, its hand's limit and the
// Reactions it runs, each by its id and the element pair the reaction is made of
export interface GcgStandardRule {
  drawCount: number;
  handCardLimit: number;
  reactions: GcgStandardReaction[];
}
