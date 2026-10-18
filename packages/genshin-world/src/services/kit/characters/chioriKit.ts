import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

// A hit's share of its striker's DEF, added to the damage its ATK share makes
const createDefenseShareBehaviour = (defenseShare: number): KitHitBehaviour => ({
  additiveBaseDamageBonus: ({ attributes }) => defenseShare * attributes.defense,
});

// Tamoto is cast where the body stands at the frame it is summoned, and stands until its duration from that frame ends
const castTamoto =
  (hits: KitHit[], secondsRemaining: number): NonNullable<KitAction["onStart"]> =>
  ({ activeCombatant: combatant, body, kitEffectState }) => {
    castKitSummon(kitEffectState, body, combatant, hits, { secondsRemaining });
  };

export const CHIORI_CHARACTER_ID = 10_000_094;

// Chiori's behaviour: the upward sweep, Tamoto's attacks and Hiyoku: Twin Blades' strike each add their share of her DEF
// To the damage their ATK share makes, and Fluttering Hasode's press and hold each cast Tamoto where she stands
// Constellation 1 needs Tamoto's AoE raised by 50% and Fluttering Hasode's Geo follow-up, which are not built
// Constellation 2 needs Kinu, a summon every three seconds for ten seconds after Hiyoku, which is not built
// Constellation 4 needs the follow-up window and the active character's attacks' Kinu strikes, which are not built
// Constellation 6 needs a cooldown cut on Fluttering Hasode after Tailor-Made's follow-up, which is not built
export const createChioriKitBehaviour = ({
  readHits,
  readParameter,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const sweepHitBehaviour = createDefenseShareBehaviour(readParameter("sweepDefenseShare"));
  const tamotoHitBehaviour = createDefenseShareBehaviour(readParameter("tamotoDefenseShare"));
  const burstHitBehaviour = createDefenseShareBehaviour(readParameter("burstDefenseShare"));
  const pressTamotoHits = readHits("pressTamotoAttacks", tamotoHitBehaviour);
  const holdTamotoHits = readHits("holdTamotoAttacks", tamotoHitBehaviour);
  const tamotoSecondsList = readSecondsList("tamotoEnds");
  return {
    burst: { hits: [burstHitBehaviour] },
    skill: { hits: [sweepHitBehaviour], onStart: castTamoto(pressTamotoHits, takeOne(tamotoSecondsList, 0)) },
    skillHolds: [{ hits: [sweepHitBehaviour], onStart: castTamoto(holdTamotoHits, takeOne(tamotoSecondsList, 1)) }],
  };
};
