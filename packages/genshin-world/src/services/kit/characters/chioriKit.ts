import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";

// A hit's share of its striker's DEF, added to the damage its ATK share makes
const createDefenseShareBehaviour = (defenseShare: number): KitHitBehaviour => ({
  additiveBaseDamageBonus: ({ attributes }) => defenseShare * attributes.defense,
});

// Tamoto is cast where the body stands, and stands from its spawn until its end frame, which the record counts from the
// Action's start. gcsim spawns it 19 frames in for the press and 34 for the hold (chiori/skill.go line 16), and the
// Game's Tamoto Duration of 17 seconds runs from there, so the record's end frames are 1039 and 1054
const TAMOTO_PRESS_SPAWN_SECONDS = toKitSeconds(19);
const TAMOTO_HOLD_SPAWN_SECONDS = toKitSeconds(34);
const castTamoto =
  (hits: KitHit[], secondsRemaining: number, spawnSeconds: number): NonNullable<KitAction["onStart"]> =>
  ({ activeCombatant: combatant, body, kitEffectState }) => {
    castKitSummon(kitEffectState, body, combatant, hits, {
      attackTag: AttackTag.ElementalSkill,
      secondsRemaining,
      spawnSeconds,
    });
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
    skill: {
      hits: [sweepHitBehaviour],
      onStart: castTamoto(pressTamotoHits, takeOne(tamotoSecondsList, 0), TAMOTO_PRESS_SPAWN_SECONDS),
    },
    skillHolds: [
      {
        hits: [sweepHitBehaviour],
        onStart: castTamoto(holdTamotoHits, takeOne(tamotoSecondsList, 1), TAMOTO_HOLD_SPAWN_SECONDS),
      },
    ],
  };
};
