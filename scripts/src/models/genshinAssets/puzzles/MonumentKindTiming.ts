import type { Element } from "genshin-world";

// The element and timing a monument's kind has as the wiki gives them, each left out where the wiki gives none
export interface MonumentKindTiming {
  element?: Element;
  isTimed?: boolean;
}
