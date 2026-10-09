import type { GcgDuel } from "#src/models/gcg/GcgDuel";

// What an effect acts on: the duel, which carries its rule, and the side whose card or skill it is
export interface GcgEffectContext {
  duel: GcgDuel;
  sideIndex: number;
}
