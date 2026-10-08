import type { LiyueBay } from "#src/models/liyue/LiyueBay";

// One bay of an openwork panel: its bars every cell, and its rails at the sill and the head
export interface LiyueLatticeOptions extends LiyueBay {
  face: number;
  head: number;
  isAlongX: boolean;
  sill: number;
}
