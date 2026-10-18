import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

// Dawn's infusion lasts 8 seconds, and A4 extends it by 4 seconds and gives a 20% Pyro damage bonus for as long
// Wiki: the Dawn infusion's duration and A4's extension and damage bonus, as gcsim v2.47.2 (MIT) diluc/burst.go gives them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const DILUC_INFUSION_SECONDS = 8;
const DILUC_A4_EXTRA_INFUSION_SECONDS = 4;
const DILUC_A4_PYRO_DAMAGE_BONUS = 0.2;
const DILUC_RELENTLESS_ASCENSION = 1;
const DILUC_RELENTLESS_STAMINA_MULTIPLIER = 0.5;

// Measured: gcsim v2.47.2 (MIT) diluc/burst.go, the phoenix spawns a metre ahead of the body and moves 14 metres a second,
// Striking eight times from its launch, and exploding 1.7 seconds after its launch, 24.8 metres on
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const DAWN_SPAWN_METRES = 1;
const DAWN_METRES_PER_SECOND = 14;
const DAWN_TICK_COUNT = 8;
const DAWN_EXPLOSION_SECONDS = 1.7;

export const DILUC_CHARACTER_ID = 10_000_016;

// Diluc's behaviour: Dawn infuses his attacks with Pyro, lengthened and joined by a Pyro DMG Bonus from Ascension 4, and
// Launches its phoenix at the slash, a summon a metre ahead of him that travels forward, strikes on each of its ticks and
// Explodes at the end of its path
export const createDilucKitBehaviour = ({
  kit,
  readArea,
  readHitFields,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  // The phoenix launches as the slash lands
  const launchSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const dawnPhoenixFields = readHitFields("dawnPhoenixHit", ["hitArea", "hitmarkSeconds", "talentMultiplier"]);
  const dawnTickArea = readArea("dawnTick");
  const dawnTickIntervalSeconds = readSeconds("dawnTickInterval");
  const dawnTickMultiplier = readParameter("dawnTickMultiplier");
  const dawnPhoenixTicks = Array.from({ length: DAWN_TICK_COUNT }, (_value, index): KitHit => ({
    ...dawnPhoenixFields,
    hitArea: dawnTickArea,
    hitmarkSeconds: launchSeconds + dawnTickIntervalSeconds * (index + 1),
    talentMultiplier: dawnTickMultiplier,
  }));
  const dawnPhoenixExplosion: KitHit = {
    ...dawnPhoenixFields,
    hitArea: readArea("dawnExplosion"),
    hitmarkSeconds: launchSeconds + DAWN_EXPLOSION_SECONDS,
    talentMultiplier: readParameter("dawnExplosionMultiplier"),
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const hasA4 = combatant.ascension >= 4;
        const secondsRemaining = DILUC_INFUSION_SECONDS + (hasA4 ? DILUC_A4_EXTRA_INFUSION_SECONDS : 0);
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Pyro,
          kind: "infusion",
          secondsRemaining,
        });
        if (hasA4)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: DILUC_A4_PYRO_DAMAGE_BONUS,
            attribute: Attribute.PyroDamageBonus,
            secondsRemaining,
          });
        castKitSummon(
          kitEffectState,
          {
            facing,
            height,
            position: {
              x: position.x - Math.sin(facing) * DAWN_SPAWN_METRES,
              z: position.z - Math.cos(facing) * DAWN_SPAWN_METRES,
            },
          },
          combatant,
          [...dawnPhoenixTicks, dawnPhoenixExplosion],
          { travel: { metresPerSecond: DAWN_METRES_PER_SECOND, startSeconds: launchSeconds } },
        );
      },
    },
    // Relentless, from Ascension 1: his charged attacks cost half their stamina
    // Its +3s duration clause is not built, since the talent text does not name what that duration is
    getChargedAttackStaminaMultiplier: ({ activeCombatant }) =>
      activeCombatant.ascension >= DILUC_RELENTLESS_ASCENSION ? DILUC_RELENTLESS_STAMINA_MULTIPLIER : 1,
  };
};
