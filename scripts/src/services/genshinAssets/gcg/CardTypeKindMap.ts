import { GcgCardKind } from "genshin-world";

export const CardTypeKindMap: Map<string, GcgCardKind> = new Map<string, GcgCardKind>([
  ["GCG_CARD_ASSIST", GcgCardKind.Support],
  ["GCG_CARD_EVENT", GcgCardKind.Event],
  ["GCG_CARD_ONSTAGE", GcgCardKind.Onstage],
  ["GCG_CARD_STATE", GcgCardKind.State],
  ["GCG_CARD_SUMMON", GcgCardKind.Summon],
]);
