import type { AbyssBenedictionChoice } from "genshin-world";

// The fields a tower buff row gives its published Benediction choice: its description's text map key, and its glyph and
// Span where the published record holds one
export type AbyssTowerBuff = Pick<AbyssBenedictionChoice, "descriptionTextHash" | "icon" | "scope">;
