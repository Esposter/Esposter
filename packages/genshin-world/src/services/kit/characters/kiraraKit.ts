import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

// Measured: gcsim (MIT, main) kirara/skill.go, Tail-Flicking Flying Kick's shield lasting 12 seconds
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kirara/skill.go
const SHIELD_SECONDS = 12;
const SELF_INFUSION_SECONDS = 0.1;

// Measured: gcsim (MIT, main) kirara/burst.go, Secret Art: Surprise Dispatch's six Cat Grass Cardamoms, the ones not
// Detonated exploding one after another from their expiry
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kirara/burst.go
const CARDAMOM_COUNT = 6;

export const KIRARA_CHARACTER_ID = 10_000_061;

// Kirara's behaviour: Tail-Flicking Flying Kick, its press and each hold, cast her shield and the 0.1 second Dendro
// Self-infusion as they start, and Secret Art: Surprise Dispatch sets its Cat Grass Cardamoms, the detonated ones first
// And the rest at expiry. Her passives and constellations are not built
export const createKiraraKitBehaviour = ({
  kit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const shieldMaxHealthShare = readParameter("shieldMaxHealthShare");
  const shieldFlatHealth = readParameter("shieldFlatHealth");
  const shieldMaximumMaxHealthShare = readParameter("shieldMaximumMaxHealthShare");
  const shieldMaximumFlatHealth = readParameter("shieldMaximumFlatHealth");
  const detonatedCardamoms = readHits("detonatedCardamoms");
  const cardamomExpiryOffsetSeconds = readSeconds("cardamomExpiryOffset");
  const cardamomIntervalSeconds = readSeconds("cardamomInterval");
  const cardamomSeconds = readParameter("cardamomSeconds");
  // The Cardamoms not detonated, each a Cardamom's hit exploding in turn from their expiry
  const expiredCardamoms = Array.from({ length: CARDAMOM_COUNT - detonatedCardamoms.length }, (_mine, index) => ({
    ...takeOne(detonatedCardamoms),
    hitmarkSeconds: cardamomExpiryOffsetSeconds + cardamomSeconds + index * cardamomIntervalSeconds,
  }));
  // The shield is a share of her Max HP and a flat amount, capped at its maximum's share and flat amount, as gcsim caps it
  const skillStart: KitActionBehaviour = {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      const { maxHealth } = combatant.attributes;
      castKitShield(kitEffectState, combatant.characterId, {
        element: Element.Dendro,
        health: Math.min(
          shieldMaxHealthShare * maxHealth + shieldFlatHealth,
          shieldMaximumMaxHealthShare * maxHealth + shieldMaximumFlatHealth,
        ),
        secondsRemaining: SHIELD_SECONDS,
      });
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Dendro,
        kind: "infusion",
        secondsRemaining: SELF_INFUSION_SECONDS,
      });
    },
  };
  return {
    // The Cardamoms are a summon cast at her body
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(kitEffectState, body, combatant, [...detonatedCardamoms, ...expiredCardamoms]),
    },
    skill: skillStart,
    skillHolds: kit.elementalSkillHolds?.map(() => skillStart),
  };
};
