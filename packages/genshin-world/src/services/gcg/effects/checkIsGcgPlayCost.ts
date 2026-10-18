import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";

// Whether a cost is a card's play: paid for the card, which a switch or a skill is not. It narrows to the card played
export const checkIsGcgPlayCost = (subject: GcgCostSubject): subject is GcgCostSubject & { card: GcgCard } =>
  subject.card !== undefined;
