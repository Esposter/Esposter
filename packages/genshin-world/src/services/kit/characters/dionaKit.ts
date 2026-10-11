import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";

import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Diona's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack's aimed shot at 7, and the plunges' collision, low and high at 8, 9 and 10. The skill group holds Icy Paws' paw
// Damage at 0, the shield's share of Max HP at 1 and its flat HP at 2, the tap's cooldown at 3, the shield's seconds at 4
// And the hold's shield bonus at 5. The burst group holds Signature Mix's initial damage at 0, its field's damage at 1,
// Its heal's share of Max HP at 2 and its flat HP at 3, its cooldown at 4, its energy cost at 5 and its seconds at 6
const DIONA_ATTACK_GROUP_ID = 3931;
const DIONA_SKILL_GROUP_ID = 3932;
const DIONA_BURST_GROUP_ID = 3939;

// Provisional: gcsim v2.47.2 (MIT) diona/attack.go gives each strike's box as a 0.1 reach half a metre ahead, which the
// Area prices as its offset plus its reach. The charged aimed shot and the plunges are not fetched from gcsim, so their
// Reaches are provisional, as the strikes' are, until the Mac measures them
const STRIKE_HIT_AREA: AttackArea = createCircleReach(0.5, 0.1);
const AIMED_SHOT_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
const PLUNGE_COLLISION_HIT_AREA: AttackArea = createCircleReach(1, 1);
const LOW_PLUNGE_HIT_AREA: AttackArea = createCircleReach(1, 3);
const HIGH_PLUNGE_HIT_AREA: AttackArea = createCircleReach(1, 5);
// Provisional: gcsim v2.47.2 (MIT) diona/skill.go gives each paw a circle of radius 0.5 on the primary target, which an
// Area does not hold, so a paw reaches the 5 metres an attack targets within, as Xingqiu's sword rain does
const PAW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) diona/burst.go, Signature Mix's field circle of radius 6.5 round the body for its ticks,
// And the heal's circle of radius 7 round the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diona/burst.go
const SIGNATURE_MIX_TICK_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6.5 });
const SIGNATURE_MIX_FIELD_RADIUS = 7;
// Provisional: gcsim v2.47.2 (MIT) diona/burst.go drops the initial hit on the primary target, which an area does not
// Hold, so it reaches the 5 metres an attack targets within, as Xingqiu's sword rain does
const SIGNATURE_MIX_INITIAL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });

// Measured: gcsim v2.47.2 (MIT) diona/attack.go, each strike's hitmark and animation at 60 fps, where the animation is the
// Frames gcsim cancels each strike at. Each strike is physical
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diona/attack.go
const DIONA_STRIKES = [
  { animationFrames: 30, hitmarkFrames: 19, index: 0 },
  { animationFrames: 21, hitmarkFrames: 11, index: 1 },
  { animationFrames: 44, hitmarkFrames: 21, index: 2 },
  { animationFrames: 21, hitmarkFrames: 10, index: 3 },
  { animationFrames: 73, hitmarkFrames: 38, index: 4 },
];

// Measured: gcsim v2.47.2 (MIT) diona/skill.go, Icy Paws' tap hitmark at 5 frames and animation at 34, its hold's at 29
// And 49, and the travel of the paws at 10 frames by default. Each paw hits at its travel plus its press's hitmark less the
// Tap's 5, then a frame per paw, and the hold sends five paws to the tap's two
const TAP_HITMARK_FRAMES = 5;
const TAP_ANIMATION_FRAMES = 34;
const TAP_PAW_COUNT = 2;
const HOLD_HITMARK_FRAMES = 29;
const HOLD_ANIMATION_FRAMES = 49;
const HOLD_PAW_COUNT = 5;
const PAW_TRAVEL_FRAMES = 10;
// Provisional: gcsim takes the hold as a parameter and gives no threshold for it, so a half second holds the skill until
// The Mac measures the game's own hold threshold
const HOLD_MINIMUM_HELD_SECONDS = 0.5;
// Measured: gcsim v2.47.2 (MIT) diona/skill.go, the hold's cooldown of 900 frames, which replaces the tap's 6 seconds
const HOLD_COOLDOWN_SECONDS = 15;
// Provisional: gcsim gives the paws no poise in its summary, so they deal none until the wiki's advanced properties are
// Measured
const PAW_POISE_DAMAGE = 0;

// Measured: gcsim v2.47.2 (MIT) diona/burst.go, the initial hit at 58 frames, the animation's 64, its field's six ticks
// From two seconds after the hit and every two, and its field's 750 frames, which the table's 12 seconds read a half second
// Short of. Its initial hit is Cryo, and the field's ticks are the field's damage, not an infusion
const SIGNATURE_MIX_HITMARK_FRAMES = 58;
const SIGNATURE_MIX_ANIMATION_FRAMES = 64;
const SIGNATURE_MIX_TICK_COUNT = 6;
const SIGNATURE_MIX_TICK_SECONDS = 2;
// Provisional: gcsim's field lasts 750 frames, half a second past the table's 12 seconds, which this adds to it
const SIGNATURE_MIX_FIELD_MARGIN_SECONDS = 0.5;
const SIGNATURE_MIX_FIELD_ID = "diona-signature-mix-field";

// Measured: gcsim v2.47.2 (MIT) diona/skill.go, Icy Paws' shield at 1.15 times its strength from two constellations, which
// Is gcsim's C2. Diona's hold shield is the table's bonus times the tap's shield
const SHIELD_CONSTELLATION = 2;
const SHIELD_CONSTELLATION_MULTIPLIER = 1.15;
// Measured: gcsim v2.47.2 (MIT) diona/cons.go, the first constellation's 15 energy returned as Signature Mix's field ends
const SIGNATURE_MIX_CONSTELLATION = 1;
const SIGNATURE_MIX_CONSTELLATION_ENERGY = 15;

export const DIONA_CHARACTER_ID = 10_000_039;

// Diona's first kit, at talent level 1: five strikes, a charged aimed shot, a collision and two plunges, Icy Paws with its
// Tap and hold, and Signature Mix with its field that ticks damage and heals. Its multipliers are read from her proud skill
// Groups. Her shield's strength is set at the press from her Max HP, and her first and second constellations are built,
// While her passives and other constellations are not, as the kit events do not reach them
export const createDionaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DIONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DIONA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DIONA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // Diona's strikes are pierce rather than blunt, as gcsim gives them, so none carries the blunt flag
  const normalAttacks: KitAction[] = DIONA_STRIKES.map(({ animationFrames, hitmarkFrames, index }): KitAction => ({
    hits: [
      {
        hitArea: STRIKE_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  // Icy Paws' paws are Cryo, each giving 1U, and each hits at its travel from its press's hitmark, less the tap's
  const createPaws = (count: number, pressHitmarkFrames: number): KitHit[] =>
    Array.from({ length: count }, (_paw, index) => ({
      element: Element.Cryo,
      gauge: 1,
      hitArea: PAW_HIT_AREA,
      hitmarkSeconds: (PAW_TRAVEL_FRAMES + (pressHitmarkFrames - TAP_HITMARK_FRAMES) + index) / 60,
      poiseDamage: PAW_POISE_DAMAGE,
      talentMultiplier: skillTalentMultiplier(0),
    }));

  // Constellation 2 raises every shield by 15%
  const createShield = (combatant: Combatant, strengthBonus: number): KitShield => ({
    characterId: combatant.characterId,
    element: Element.Cryo,
    health:
      (skillTalentMultiplier(1) * combatant.attributes.maxHealth + skillTalentMultiplier(2)) *
      strengthBonus *
      (combatant.constellationCount >= SHIELD_CONSTELLATION ? SHIELD_CONSTELLATION_MULTIPLIER : 1),
    kind: "shield",
    secondsRemaining: skillTalentMultiplier(4),
  });

  // Signature Mix's ticks are damage each, from the cast's body, one every two seconds from two seconds after the hit
  const signatureMixTickHits: KitHit[] = Array.from({ length: SIGNATURE_MIX_TICK_COUNT }, (_tick, index) => ({
    element: Element.Cryo,
    hitArea: SIGNATURE_MIX_TICK_HIT_AREA,
    hitmarkSeconds: SIGNATURE_MIX_HITMARK_FRAMES / 60 + (index + 1) * SIGNATURE_MIX_TICK_SECONDS,
    poiseDamage: 0,
    talentMultiplier: burstTalentMultiplier(1),
  }));
  const signatureMixSeconds = burstTalentMultiplier(6) + SIGNATURE_MIX_FIELD_MARGIN_SECONDS;

  return {
    burstCooldownSeconds: burstTalentMultiplier(4),
    burstEnergyCost: burstTalentMultiplier(5),
    chargedAttack: {
      hits: [
        {
          hitArea: AIMED_SHOT_HIT_AREA,
          hitmarkSeconds: 0.5,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(7),
        },
      ],
      // Provisional: the charged aimed shot's animation is not fetched from gcsim, so its seconds are a provisional figure
      // Until the Mac measures them, and it drains no stamina as a bow's aim does not
      seconds: 1,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [
        {
          element: Element.Cryo,
          gauge: 1,
          hitArea: SIGNATURE_MIX_INITIAL_HIT_AREA,
          hitmarkSeconds: SIGNATURE_MIX_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      onStart: ({ body, combatant, kitEffectState }) => {
        const field: KitField = {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          id: SIGNATURE_MIX_FIELD_ID,
          kind: "field",
          nextTickSeconds: SIGNATURE_MIX_HITMARK_FRAMES / 60 + SIGNATURE_MIX_TICK_SECONDS,
          onTick: ({ activeCombatant, party }) =>
            healPartyMember(
              party,
              activeCombatant.characterId,
              (burstTalentMultiplier(2) * combatant.attributes.maxHealth + burstTalentMultiplier(3)) /
                activeCombatant.attributes.maxHealth,
            ),
          radius: SIGNATURE_MIX_FIELD_RADIUS,
          secondsRemaining: signatureMixSeconds,
          tickIndex: 0,
          tickIntervalSeconds: SIGNATURE_MIX_TICK_SECONDS,
        };
        addKitEffect(kitEffectState, field);
        addKitEffect(kitEffectState, createKitSummon(body, combatant, signatureMixTickHits, signatureMixSeconds));
      },
      seconds: SIGNATURE_MIX_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: createPaws(TAP_PAW_COUNT, TAP_HITMARK_FRAMES),
      onStart: ({ combatant, kitEffectState }) => addKitEffect(kitEffectState, createShield(combatant, 1)),
      seconds: TAP_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillHolds: [
      {
        action: {
          hits: createPaws(HOLD_PAW_COUNT, HOLD_HITMARK_FRAMES),
          onStart: ({ combatant, kitEffectState }) =>
            addKitEffect(kitEffectState, createShield(combatant, skillTalentMultiplier(5))),
          seconds: HOLD_ANIMATION_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: HOLD_COOLDOWN_SECONDS,
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0.5,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      // Provisional: the plunges' frames are not fetched from gcsim, so they are provisional until the Mac measures them
      seconds: 1,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0.5,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: 1,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // Constellation 1 returns 15 energy to Diona as her field ends, as the game's text gives it
    onKitEvent: (event, { combatant, party }) => {
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "field" &&
        event.effect.id === SIGNATURE_MIX_FIELD_ID &&
        event.effect.characterId === combatant.characterId &&
        combatant.constellationCount >= SIGNATURE_MIX_CONSTELLATION
      )
        gainPartyMemberEnergy(party, combatant, SIGNATURE_MIX_CONSTELLATION_ENERGY);
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(3),
  };
};
