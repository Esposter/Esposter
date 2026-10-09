import type { Element } from "#src/models/Element";
import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

// What a cost is paid for: the skill a character uses or the card played, at most one of them named, the costs still to
// Pay after the reductions so far, and the element of the character paying, which its Matching dice follow
export interface GcgCostSubject {
  card?: GcgCard;
  costs: GcgCost[];
  element: Element;
  skill?: GcgSkill;
}
