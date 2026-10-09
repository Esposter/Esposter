import type { Element } from "genshin-world";

export interface GcgStandardReaction {
  elements: [Element, Element];
  id: number;
}

// The duel rule a slice is written from: how many cards a side draws at each end phase, its hand's limit and the
// Reactions it runs, each by its id and the element pair the reaction is made of
export interface GcgStandardRule {
  drawCount: number;
  handCardLimit: number;
  reactions: GcgStandardReaction[];
}
