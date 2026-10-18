import type { Element } from "#src/models/Element";

// A CRIT DMG bonus on one character's strikes of one element, added to the CRIT DMG each of them is priced from, for the
// Seconds left of it. A source names the effect that gives it, so one effect's restart leaves another's standing
export interface KitElementCriticalDamage {
  amount: number;
  characterId: number;
  element: Element;
  kind: "elementCriticalDamage";
  secondsRemaining: number;
  source?: string;
}
