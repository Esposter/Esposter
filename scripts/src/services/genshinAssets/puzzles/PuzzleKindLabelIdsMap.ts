import type { PuzzleKind } from "genshin-world";

// The official map's label ids of each puzzle kind, from its label tree as the points were read. A Seelie's variants and
// Each nation's shrine carry labels of their own under the same kind, so each kind lists every label it takes. Mondstadt's
// Shrine of Depths label is named for its region alone, so it is listed too, with Liyue's (labels 8 and 9)
export const PuzzleKindLabelIdsMap: Record<PuzzleKind, number[]> = {
  ElementalMonument: [70],
  Seelie: [18, 148, 205],
  SeelieCourt: [147],
  ShrineOfDepths: [8, 9, 212, 411, 509, 577, 703, 835],
  TimeTrialChallenge: [64],
};
