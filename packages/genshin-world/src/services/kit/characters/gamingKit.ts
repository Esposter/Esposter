import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";

export const GAMING_CHARACTER_ID = 10_000_092;

// Constellation 2, Plum Blossoms Underfoot: his ATK is raised for five seconds when his healing overflows
const CONSTELLATION_2_ATTACK_PERCENT = 0.2;
const CONSTELLATION_2_SECONDS = 5;

// Gaming's behaviour: none of his own, since his strikes, charged attack, plunges, Bestial Ascent and Suanni's Gilded
// Dance's strike are his record's alone. Bestial Ascent's Charmed Cloudstrider plunge, which the kit has no plunge variant
// To hold, Suanni's Gilded Dance's heal, his Ascension 1 passive, and Constellations 1, 4 and 6 are not built.
// Air of Prosperity's Incoming Healing Bonus under half his HP is built from Ascension 4, as a passive bonus; its
// plunge clause waits on that plunge Variant, and the bonus reads his HP share as the party holds it
const ASCENSION_4 = 4;
const AIR_OF_PROSPERITY_HEALTH_SHARE = 0.5;
const AIR_OF_PROSPERITY_INCOMING_HEALING_BONUS = 0.2;

export const createGamingKitBehaviour = (): KitBehaviour => ({
  getPassiveBonuses: (combatant, healthShare) =>
    combatant.ascension >= ASCENSION_4 && healthShare < AIR_OF_PROSPERITY_HEALTH_SHARE
      ? [{ amount: AIR_OF_PROSPERITY_INCOMING_HEALING_BONUS, attribute: Attribute.IncomingHealingBonus }]
      : [],
  onKitEvent: (event, { kitEffectState }, combatant) => {
    if (event.kind !== KitEventKind.HealthChanged || combatant.constellationCount < 2) return;
    if (event.characterId !== combatant.characterId || event.overflowHealthShare <= 0) return;

    buffKitMember(kitEffectState, combatant.characterId, {
      amount: CONSTELLATION_2_ATTACK_PERCENT,
      attribute: Attribute.AttackPercent,
      secondsRemaining: CONSTELLATION_2_SECONDS,
    });
  },
});
