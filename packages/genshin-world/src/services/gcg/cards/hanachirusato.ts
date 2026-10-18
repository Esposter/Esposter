import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";

export const HANACHIRUSATO_ID = 322_013;
const HANACHIRUSATO_PROGRESS_LIMIT = 3;
const HANACHIRUSATO_REDUCTION = 2;

// Hanachirusato, a companion support: each summon that disappears from its side gives it 1 Cleansing Ritual Progress, up to
// Three. Playing a Weapon or an Artifact with three Progress costs two Elemental Dice less, and discards Hanachirusato
export const hanachirusato: GcgCardModule = {
  initialUsages: 1,
  onCostPaid: (_context, _subject, zoneCard) => {
    zoneCard.usages = 0;
  },
  onSummonDisappears: (_context, zoneCard) => {
    zoneCard.counter = Math.min(HANACHIRUSATO_PROGRESS_LIMIT, zoneCard.counter + 1);
  },
  reduceCost: (_context, subject, zoneCard) =>
    zoneCard.counter >= HANACHIRUSATO_PROGRESS_LIMIT &&
    (subject.card?.kind === GcgCardKind.Weapon || subject.card?.kind === GcgCardKind.Artifact)
      ? { count: HANACHIRUSATO_REDUCTION, kind: GcgCostKind.Dice }
      : undefined,
};
