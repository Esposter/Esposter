import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const XILONEN_CHARACTER_ID = 10_000_103;

// Xilonen's behaviour: none of her own, as her record builds the whole kit, the skill's and the plunges' damage each a share
// Of her Defense. The Blade Roller strikes and the rest of the Nightsoul Blessing the press starts are not built, nor is
// Ocelotlicue Point: its damage is read only with fewer than two Samplers in the party, which a kit step cannot count yet,
// And its heal, which it gives with two or more, is a timed heal that is not built either
export const createXilonenKitBehaviour = (): KitBehaviour => ({});
