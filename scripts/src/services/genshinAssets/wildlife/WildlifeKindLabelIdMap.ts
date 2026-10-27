import { WildlifeKind } from "genshin-world";

// The official map's label id of each animal kind, from its label tree as the points were read, under Animals. The
// Labels name each kind as the codex does, and each label is one kind of one species, so a place takes its kind by its label
export const WildlifeKindLabelIdMap: Record<WildlifeKind, number> = {
  [WildlifeKind.Boar]: 313,
  [WildlifeKind.CrimsonFox]: 284,
  [WildlifeKind.Squirrel]: 306,
  [WildlifeKind.WhitePigeon]: 274,
};
