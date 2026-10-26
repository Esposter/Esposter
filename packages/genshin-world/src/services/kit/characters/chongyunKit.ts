import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { MELEE_WEAPON_TYPES } from "#src/services/kit/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) chongyun/skill.go, the field Layered Frost leaves, a circle of radius 8 placed where the
// Press's hit is, a metre and a half ahead of the body, and ticking each second from the hit, which infuses the active
// Character with Cryo while it stands in the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/skill.go
const FIELD_RADIUS = 8;
const FIELD_OFFSET_METRES = 1.5;
const FIELD_TICK_SECONDS = 1;
// The field lasts from its hit for its seconds, which the table gives as 10, and a tenth of a second past its last tick
const FIELD_TICK_MARGIN_SECONDS = 0.1;

// Steady Breathing, from Ascension 1: a sword, claymore or polearm wielder the field infuses has its Normal ATK SPD
// Raised by 8% for as long as the infusion holds, as gcsim v2.47.2 (MIT) chongyun/skill.go gives it with the infusion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/skill.go
const STEADY_BREATHING_ASCENSION = 1;
const STEADY_BREATHING_NORMAL_ATTACK_SPEED_BONUS = 0.08;
// Rimechaser Blade, from Ascension 4: as the field disappears a blade strikes the enemy nearest its centre within it, or
// Its centre, for 100% of Layered Frost's damage, cutting the Cryo RES of the enemies it hits by 10% for 8 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/asc.go
// https://genshin-impact.fandom.com/wiki/Rimechaser_Blade
const RIMECHASER_BLADE_ASCENSION = 4;
const RIMECHASER_BLADE_STATUS_ID = "chongyun-rimechaser-blade";
const RIMECHASER_BLADE_CRYO_RESISTANCE_REDUCTION = 0.1;
const RIMECHASER_BLADE_STATUS_SECONDS = 8;
// Ice Unleashed, from one constellation: the fourth strike releases its ice blades
// https://genshin-impact.fandom.com/wiki/Ice_Unleashed
const ICE_UNLEASHED_CONSTELLATION = 1;
// Atmospheric Revolution, from two constellations: a skill or burst the infused wielder casts has its cooldown cut by 15%
// While the infusion holds, wherever it stands
const ATMOSPHERIC_REVOLUTION_CONSTELLATION = 2;
const ATMOSPHERIC_REVOLUTION_COOLDOWN_MULTIPLIER = 0.85;
// Frozen Skies, from four constellations: Chongyun's hits on an enemy with Cryo on it while he is on the field give him
// 1 energy, at most once every 2 seconds, as the game's text gives it where gcsim gives 2
// https://genshin-impact.fandom.com/wiki/Frozen_Skies
const FROZEN_SKIES_CONSTELLATION = 4;
const FROZEN_SKIES_ENERGY = 1;
const FROZEN_SKIES_COOLDOWN_STATUS_ID = "chongyun-frozen-skies-cooldown";
const FROZEN_SKIES_COOLDOWN_SECONDS = 2;
// Rally of Four Blades, from six constellations: Cloud-Parting Star deals 15% more DMG to an enemy with a lower share of
// Its Max HP left than Chongyun, and calls a fourth blade, as gcsim v2.47.2 (MIT) chongyun/burst.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chongyun/burst.go
const RALLY_OF_FOUR_BLADES_CONSTELLATION = 6;
const RALLY_OF_FOUR_BLADES_DAMAGE_BONUS = 0.15;

const FROST_FIELD_ID = "chongyun-frost-field";

// Whether an effect is Layered Frost's field
const checkIsFrostField = (effect: KitEffect): effect is KitField =>
  effect.kind === "field" && effect.id === FROST_FIELD_ID;

export const CHONGYUN_CHARACTER_ID = 10_000_036;

// Chongyun's behaviour: Spirit Blade: Chonghua's Layered Frost casts its field, which infuses the active character and
// The character a swap brings on while it stands, a press replacing the field standing, and from six constellations
// Spirit Blade: Cloud-Parting Star calls Rally of Four Blades' fourth blade and deals its bonus. Rimechaser Blade, Ice
// Unleashed and Frozen Skies answer the kit's events
export const createChongyunKitBehaviour = ({
  kit,
  readHit,
  readHits,
  readParameter,
}: KitRecordReader): KitBehaviour => {
  const infusionSeconds = readParameter("infusionSeconds");
  const skillHitmarkSeconds = takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  const fieldSeconds = readParameter("frostFieldSeconds") + skillHitmarkSeconds + FIELD_TICK_MARGIN_SECONDS;
  const rimechaserBladeHit = readHit("rimechaserBlade", {
    enemyStatus: () => ({
      damageTakenBonus: 0,
      id: RIMECHASER_BLADE_STATUS_ID,
      resistanceReduction: { [Element.Cryo]: RIMECHASER_BLADE_CRYO_RESISTANCE_REDUCTION },
      secondsRemaining: RIMECHASER_BLADE_STATUS_SECONDS,
    }),
  });
  const iceUnleashedHits = readHits("iceUnleashed");
  const burstBladeHits = kit.elementalBurst.hits;
  const rallyOfFourBladesHit = readHit("rallyOfFourBlades");
  const fourthStrike = kit.normalAttacks.at(-1);
  // The field's infusion on a character, with Steady Breathing's Normal ATK SPD from Ascension 1
  const infuse = (
    kitEffectState: KitEffectState,
    { ascension, constellationCount }: Combatant,
    { characterId, weaponType }: Combatant,
  ): void => {
    if (weaponType === undefined || !MELEE_WEAPON_TYPES.has(weaponType)) return;
    addKitEffect(kitEffectState, {
      characterId,
      ...(constellationCount >= ATMOSPHERIC_REVOLUTION_CONSTELLATION && {
        cooldownMultiplier: ATMOSPHERIC_REVOLUTION_COOLDOWN_MULTIPLIER,
      }),
      element: Element.Cryo,
      kind: "infusion",
      ...(ascension >= STEADY_BREATHING_ASCENSION && {
        normalAttackSpeedBonus: STEADY_BREATHING_NORMAL_ATTACK_SPEED_BONUS,
      }),
      secondsRemaining: infusionSeconds,
    });
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (combatant.constellationCount >= RALLY_OF_FOUR_BLADES_CONSTELLATION)
          castKitSummon(kitEffectState, body, combatant, [rallyOfFourBladesHit], {
            attackTag: AttackTag.ElementalBurst,
          });
      },
    },
    getStrikeDamageBonus: ({ combatant, hit }, enemy, party) =>
      combatant.constellationCount >= RALLY_OF_FOUR_BLADES_CONSTELLATION &&
      (burstBladeHits.includes(hit) || hit === rallyOfFourBladesHit) &&
      enemy.health / enemy.maxHealth < getPartyMember(party, combatant.characterId).healthShare
        ? RALLY_OF_FOUR_BLADES_DAMAGE_BONUS
        : 0,
    // A swap brings the field's infusion on whoever comes on while it stands, its end strikes Rimechaser Blade from
    // Ascension 4, and the fourth strike's ice blades and the energy on a Cryo enemy come from one and four constellations
    onKitEvent: (event, { activeCombatant, body, enemyMap, kitEffectState, party }, combatant) => {
      const { ascension, characterId, constellationCount } = combatant;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (kitEffectState.effects.some((effect) => checkIsFrostField(effect)))
          infuse(kitEffectState, combatant, activeCombatant);
      } else if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (!checkIsFrostField(effect) || effect.characterId !== characterId || ascension < RIMECHASER_BLADE_ASCENSION)
          return;
        const { centre, radius } = effect;
        const enemy = selectAttackTarget(
          { angle: 2 * Math.PI, height: Number.POSITIVE_INFINITY, radius },
          createKitBody(centre),
          enemyMap.values(),
        );
        castKitSummon(kitEffectState, createKitBody(enemy?.position ?? centre), combatant, [rimechaserBladeHit], {
          attackTag: AttackTag.ElementalSkill,
        });
      } else if (event.kind === KitEventKind.NormalAttackLanded) {
        if (
          activeCombatant.characterId === characterId &&
          constellationCount >= ICE_UNLEASHED_CONSTELLATION &&
          event.action === fourthStrike
        )
          castKitSummon(kitEffectState, body, combatant, iceUnleashedHits);
      } else if (event.kind === KitEventKind.DamageTaken) {
        if (
          constellationCount < FROZEN_SKIES_CONSTELLATION ||
          event.striker.characterId !== characterId ||
          activeCombatant.characterId !== characterId ||
          !event.enemy.elementalState.auras.has(AuraType.Cryo) ||
          !startKitCooldown(kitEffectState, characterId, FROZEN_SKIES_COOLDOWN_STATUS_ID, FROZEN_SKIES_COOLDOWN_SECONDS)
        )
          return;
        gainPartyMemberEnergy(party, combatant, FROZEN_SKIES_ENERGY);
      }
    },
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        // A press ends the field standing, which disappears on the next step, and places its own as the press's hit is, a
        // Metre and a half ahead of the body
        for (const effect of kitEffectState.effects) if (checkIsFrostField(effect)) effect.secondsRemaining = 0;
        castKitField(
          kitEffectState,
          combatant.characterId,
          {
            x: body.position.x - Math.sin(body.facing) * FIELD_OFFSET_METRES,
            z: body.position.z - Math.cos(body.facing) * FIELD_OFFSET_METRES,
          },
          {
            id: FROST_FIELD_ID,
            nextTickSeconds: skillHitmarkSeconds,
            onTick: ({ activeCombatant, kitEffectState: tickEffectState }) =>
              infuse(tickEffectState, combatant, activeCombatant),
            radius: FIELD_RADIUS,
            secondsRemaining: fieldSeconds,
            tickIntervalSeconds: FIELD_TICK_SECONDS,
          },
        );
      },
    },
  };
};
