import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { AbyssPeriodBlessing } from "#src/models/spiralAbyss/AbyssPeriodBlessing";

// What a chamber offers when entered: the blessing of its Moon Spire period, or the Benedictions a Corridor chamber's list holds
export type AbyssChamberBlessing =
  | { blessing: AbyssPeriodBlessing; kind: "period" }
  | { choices: AbyssBenedictionChoice[]; kind: "choices" };
