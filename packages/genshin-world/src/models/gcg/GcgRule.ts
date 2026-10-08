import type { GcgReactionRule } from "#src/models/gcg/GcgReactionRule";

// The duel rule a duel runs: how many cards a side draws at each end phase, its hand's limit, and the reactions it lists
export interface GcgRule {
  drawCount: number;
  handCardLimit: number;
  reactions: GcgReactionRule[];
}
