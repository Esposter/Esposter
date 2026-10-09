import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// Razor's proud skill groups, read at his talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's cyclic and final slashes at 4 and 5 and its stamina a second at 6, and the plunges' collision, low and high at
// 8, 9 and 10. The skill group holds the press at 0 and the hold at 1, an Electro Sigil's Energy Recharge at 2, the
// Energy each cleared sigil gives at 3 and a sigil's seconds at 4, and the press's and the hold's cooldowns at 5 and 6.
// The burst group holds Lightning Fang at 0, the Soul Companion's share of a strike's multiplier at 1, the Electro RES
// Bonus at 3, the Wolf Within's seconds at 4, and the burst's cooldown and energy cost at 5 and 6
const RAZOR_ATTACK_GROUP_ID = 2031;
const RAZOR_SKILL_GROUP_ID = 2032;
const RAZOR_BURST_GROUP_ID = 2039;

// Measured: gcsim v2.47.2 (MIT) razor/attack.go, the first and third strikes' circles of radius 2 centred a metre ahead,
// The second's box 3.2 wide and 3 long from half a metre ahead, and the fourth's circle of radius 2 centred 1.8 metres
// Ahead, each priced as its far reach from the body until an area holds an offset
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/attack.go
const STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2 });
const SECOND_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(0.5 + 3, 3.2 / 2),
});
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.8 + 2 });
// Measured: gcsim v2.47.2 (MIT) razor/config.yml, the charged attack's spinning circle of radius 3 centred 0.3 metres
// Ahead and its final circle of radius 3.5, both marked not yet implemented there
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/config.yml
const CHARGED_CYCLIC_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.3 + 3 });
const CHARGED_FINAL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Measured: gcsim v2.47.2 (MIT) razor/plunge.go, the collision's circle of radius 1 and the low and high plunges' of 3
// And 5, each centred a metre ahead
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 5 });
// Measured: gcsim v2.47.2 (MIT) razor/skill.go, the press's fan of 240 degrees and radius 2.4 centred a metre ahead, and
// The hold's circle of radius 5 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/skill.go
const PRESS_HIT_AREA: AttackArea = Object.freeze({ angle: (4 * Math.PI) / 3, height: 2, radius: 1 + 2.4 });
const HOLD_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) razor/burst.go, Lightning Fang's circle of radius 5 round the body, and the Soul
// Companion's beside each strike: circles of radius 2.4 centred a metre ahead for the first and third, a box 3.4 wide and
// Long from half a metre ahead for the second, and a circle of radius 2.4 centred 1.8 metres ahead for the fourth
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/burst.go
const LIGHTNING_FANG_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
const SOUL_COMPANION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2.4 });
const SECOND_SOUL_COMPANION_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(0.5 + 3.4, 3.4 / 2),
});
const FOURTH_SOUL_COMPANION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.8 + 2.4 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) razor/attack.go, each strike's hitmark and the animation that ends it at 60 fps, with its
// Reach and its Soul Companion's. Each strike's poise is the wiki's Steel Fang advanced properties, and its Soul
// Companion's the wiki's Lightning Fang
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/attack.go
const RAZOR_STRIKES = [
  {
    frames: 45,
    hitArea: STRIKE_HIT_AREA,
    hitmarkFrames: 25,
    poiseDamage: 112.93,
    soulCompanionHitArea: SOUL_COMPANION_HIT_AREA,
    soulCompanionPoiseDamage: 88.23,
  },
  {
    frames: 33,
    hitArea: SECOND_STRIKE_HIT_AREA,
    hitmarkFrames: 16,
    poiseDamage: 97.27,
    soulCompanionHitArea: SECOND_SOUL_COMPANION_HIT_AREA,
    soulCompanionPoiseDamage: 76.12,
  },
  {
    frames: 47,
    hitArea: STRIKE_HIT_AREA,
    hitmarkFrames: 13,
    poiseDamage: 121.67,
    soulCompanionHitArea: SOUL_COMPANION_HIT_AREA,
    soulCompanionPoiseDamage: 95.15,
  },
  {
    frames: 116,
    hitArea: FOURTH_STRIKE_HIT_AREA,
    hitmarkFrames: 38,
    poiseDamage: 160.19,
    soulCompanionHitArea: FOURTH_SOUL_COMPANION_HIT_AREA,
    soulCompanionPoiseDamage: 124.26,
  },
];

// Measured: gcsim v2.47.2 (MIT) razor/skill.go, the hold's hit at 55 frames, where its sigils are cleared, which this
// Kit counts from the hold's release
const HOLD_HITMARK_FRAMES = 55;
// Provisional: no table or wiki page gives the seconds a press must be held to become the hold, so it is Bennett's first
// Charge Level's, until a recording measures it
const HOLD_MINIMUM_HELD_SECONDS = 0.5;
// The wiki's Claw and Thunder holds up to three Electro Sigils at once, a new one restarting their seconds
const ELECTRO_SIGIL_MAX_COUNT = 3;
const ELECTRO_SIGIL_SOURCE = "Electro Sigil";
// Measured: gcsim v2.47.2 (MIT) razor/burst.go, the sigils cleared at 7 frames and the hit at 32, from which the Wolf
// Within stands for its seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/burst.go
const LIGHTNING_FANG_SIGIL_CLEAR_FRAMES = 7;
const LIGHTNING_FANG_HITMARK_FRAMES = 32;
const LIGHTNING_FANG_SOURCE = "Lightning Fang";
// Awakening, from Ascension 1, cuts Claw and Thunder's cooldown by 18% and resets it as Lightning Fang hits, as the wiki's
// Passive page and gcsim v2.47.2 (MIT) razor/asc.go give it
// https://genshin-impact.fandom.com/wiki/Awakening
const AWAKENING_ASCENSION = 1;
const AWAKENING_COOLDOWN_MULTIPLIER = 0.82;
// Lupus Fulguris, from six constellations, charges Razor's claymore every 10 seconds, and the next strike's hit releases
// Lightning of 100% of his ATK, 1U of Electro with no internal cooldown and the wiki's 69 poise, landing a frame past it in
// Gcsim v2.47.2 (MIT) razor/cons.go
// https://genshin-impact.fandom.com/wiki/Lupus_Fulguris
const LUPUS_FULGURIS_CONSTELLATION = 6;
const LUPUS_FULGURIS_RECHARGE_SECONDS = 10;

// Whether an effect is a buff on Razor from one of his own sources: his Electro Sigils, whose Energy Recharge holds each
// Sigil's share of it, or the Wolf Within's Electro RES, which marks Lightning Fang standing
const checkIsRazorBuff = (effect: KitEffect, characterId: number, source: string): effect is KitBuff =>
  effect.kind === "buff" && effect.characterId === characterId && effect.source === source;

// Razor's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Claw and Thunder's
// Press and hold with their Electro Sigils, and Lightning Fang with its Wolf Within. Its multipliers are read from his
// Proud skill groups
export const createRazorKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const sigilEnergyRecharge = getTalentMultiplier(talentMultiplierMap, RAZOR_SKILL_GROUP_ID, TALENT_START_LEVEL, 2);
  const sigilEnergy = getTalentMultiplier(talentMultiplierMap, RAZOR_SKILL_GROUP_ID, TALENT_START_LEVEL, 3);
  const sigilSeconds = getTalentMultiplier(talentMultiplierMap, RAZOR_SKILL_GROUP_ID, TALENT_START_LEVEL, 4);
  const soulCompanionShare = getTalentMultiplier(talentMultiplierMap, RAZOR_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  const electroResistanceBonus = getTalentMultiplier(talentMultiplierMap, RAZOR_BURST_GROUP_ID, TALENT_START_LEVEL, 3);
  const wolfWithinSeconds = getTalentMultiplier(talentMultiplierMap, RAZOR_BURST_GROUP_ID, TALENT_START_LEVEL, 4);
  // The Electro Sigils Razor holds, read off the Energy Recharge they give him
  const getElectroSigilCount = (characterId: number, effects: readonly KitEffect[]): number => {
    const sigilBuff = effects.find((effect) => checkIsRazorBuff(effect, characterId, ELECTRO_SIGIL_SOURCE));
    return sigilBuff === undefined ? 0 : Math.round(sigilBuff.amount / sigilEnergyRecharge);
  };
  // Gives Razor an Electro Sigil, up to three, restarting the seconds of those he holds
  const addElectroSigil = (characterId: number, kitEffectState: KitEffectState): void =>
    addKitEffect(kitEffectState, {
      amount:
        sigilEnergyRecharge *
        Math.min(ELECTRO_SIGIL_MAX_COUNT, getElectroSigilCount(characterId, kitEffectState.effects) + 1),
      attribute: Attribute.EnergyRecharge,
      characterId,
      kind: "buff",
      secondsRemaining: sigilSeconds,
      source: ELECTRO_SIGIL_SOURCE,
    });
  // Clears Razor's Electro Sigils at a hitmark, each giving him its energy up to what his burst costs, through a field
  // With no edge that ticks once there, on the step the hitmark falls in
  const createElectroSigilClear = (owner: Combatant, centre: GroundPoint, hitmarkFrames: number): KitField => ({
    centre,
    characterId: owner.characterId,
    kind: "field",
    nextTickSeconds: hitmarkFrames / 60,
    onTick: ({ kitEffectState, party }) => {
      const sigilCount = getElectroSigilCount(owner.characterId, kitEffectState.effects);
      if (sigilCount === 0) return;
      const partyMember = getPartyMember(party, owner.characterId);
      partyMember.energy = Math.min(owner.kit.burstEnergyCost, partyMember.energy + sigilEnergy * sigilCount);
      kitEffectState.effects = kitEffectState.effects.filter(
        (effect) => !checkIsRazorBuff(effect, owner.characterId, ELECTRO_SIGIL_SOURCE),
      );
    },
    radius: UNBOUNDED_FIELD_RADIUS,
    // The field lives a tenth of a second past its tick, so the step that runs it still has it
    secondsRemaining: hitmarkFrames / 60 + 0.1,
    tickIndex: 0,
    tickIntervalSeconds: Number.POSITIVE_INFINITY,
  });
  // Lightning Fang's Wolf Within, from the burst's hit for its seconds while Razor stays on the field. Its first tick, at
  // The hit, resets his skill's cooldown from Ascension 1 and gives him the Electro RES bonus that marks it standing, and
  // A tick on every step after ends both once he has left the field
  const createWolfWithin = (owner: Combatant, centre: GroundPoint): KitField => {
    const wolfWithin: KitField = {
      centre,
      characterId: owner.characterId,
      kind: "field",
      nextTickSeconds: LIGHTNING_FANG_HITMARK_FRAMES / 60,
      onTick: ({ activeCombatant, kitEffectState, party, tickIndex }) => {
        if (activeCombatant.characterId !== owner.characterId) {
          kitEffectState.effects = kitEffectState.effects.filter(
            (effect) => effect !== wolfWithin && !checkIsRazorBuff(effect, owner.characterId, LIGHTNING_FANG_SOURCE),
          );
          return;
        }
        if (tickIndex > 0) return;
        if (owner.ascension >= AWAKENING_ASCENSION) getPartyMember(party, owner.characterId).skillCooldownSeconds = 0;
        addKitEffect(kitEffectState, {
          amount: electroResistanceBonus,
          attribute: Attribute.ElectroResistance,
          characterId: owner.characterId,
          kind: "buff",
          secondsRemaining: wolfWithinSeconds,
          source: LIGHTNING_FANG_SOURCE,
        });
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: LIGHTNING_FANG_HITMARK_FRAMES / 60 + wolfWithinSeconds,
      tickIndex: 0,
      tickIntervalSeconds: FIXED_STEP_SECONDS,
    };
    return wolfWithin;
  };
  // Lupus Fulguris's lightning beside each strike, reaching what the strike reaches, since an area cannot hold the 1.5
  // Metre circle gcsim centres on the enemy struck
  const lupusFulgurisHits = RAZOR_STRIKES.map(({ hitArea, hitmarkFrames }): KitHit => ({
    element: Element.Electro,
    gauge: 1,
    hitArea,
    hitmarkSeconds: (hitmarkFrames + 1) / 60,
    poiseDamage: 69,
    talentMultiplier: 1,
  }));
  // Whether Razor's claymore is still charging since its last lightning, whose summon stands for the recharge
  const checkIsLupusFulgurisCharging = (characterId: number, effects: readonly KitEffect[]): boolean =>
    effects.some(
      (effect) =>
        effect.kind === "summon" &&
        effect.combatant.characterId === characterId &&
        effect.hits.some((hit) => lupusFulgurisHits.includes(hit)),
    );
  // Razor's strikes are physical and blunt under his Normal Attack internal cooldown. While Lightning Fang stands, a strike
  // Casts its Soul Companion, 1U of Electro at the burst group's share of the strike's multiplier under the Elemental Burst
  // Internal cooldown, a frame past the strike as gcsim lands it. From six constellations, a strike while his claymore is
  // Charged casts Lupus Fulguris's lightning, whose summon stands until 10 seconds past the strike's hit, and gives him an
  // Electro Sigil outside Lightning Fang
  const normalAttacks = RAZOR_STRIKES.map(
    (
      { frames, hitArea, hitmarkFrames, poiseDamage, soulCompanionHitArea, soulCompanionPoiseDamage },
      index,
    ): KitAction => {
      const talentMultiplier = getTalentMultiplier(
        talentMultiplierMap,
        RAZOR_ATTACK_GROUP_ID,
        TALENT_START_LEVEL,
        index,
      );
      const soulCompanionHit: KitHit = {
        element: Element.Electro,
        gauge: 1,
        hitArea: soulCompanionHitArea,
        hitmarkSeconds: (hitmarkFrames + 1) / 60,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: soulCompanionPoiseDamage,
        talentMultiplier: soulCompanionShare * talentMultiplier,
      };
      const lupusFulgurisHit = takeOne(lupusFulgurisHits, index);
      return {
        hits: [
          {
            hitArea,
            hitmarkSeconds: hitmarkFrames / 60,
            internalCooldownTag: InternalCooldownTag.NormalAttack,
            isBlunt: true,
            poiseDamage,
            talentMultiplier,
          },
        ],
        onStart: ({ body, combatant, kitEffectState }) => {
          const isLightningFangLive = kitEffectState.effects.some((effect) =>
            checkIsRazorBuff(effect, combatant.characterId, LIGHTNING_FANG_SOURCE),
          );
          if (isLightningFangLive) addKitEffect(kitEffectState, createKitSummon(body, combatant, [soulCompanionHit]));
          if (
            combatant.constellationCount < LUPUS_FULGURIS_CONSTELLATION ||
            checkIsLupusFulgurisCharging(combatant.characterId, kitEffectState.effects)
          )
            return;
          addKitEffect(
            kitEffectState,
            createKitSummon(body, combatant, [lupusFulgurisHit], hitmarkFrames / 60 + LUPUS_FULGURIS_RECHARGE_SECONDS),
          );
          if (!isLightningFangLive) addElectroSigil(combatant.characterId, kitEffectState);
        },
        seconds: frames / 60,
        targetingArea: STRIKE_TARGETING_AREA,
      };
    },
  );
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, RAZOR_BURST_GROUP_ID, TALENT_START_LEVEL, 5),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, RAZOR_BURST_GROUP_ID, TALENT_START_LEVEL, 6),
    // Provisional: gcsim does not model the charged attack and the wiki's table gives no frames for it, so its two slashes
    // Land at half a second and a second and it ends at a second and a fifth, as Diluc's do, until a recording measures
    // Them. The wiki's Steel Fang gives the cyclic slash 60 poise and the final 120, both blunt under the Normal Attack
    // Internal cooldown
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_CYCLIC_HIT_AREA,
          hitmarkSeconds: 0.5,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage: 60,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
        },
        {
          hitArea: CHARGED_FINAL_HIT_AREA,
          hitmarkSeconds: 1,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage: 120,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
        },
      ],
      seconds: 1.2,
      // The table's stamina a second for the spin, 40, drained while the charge plays, as Diluc's is
      staminaPerSecond: getTalentMultiplier(talentMultiplierMap, RAZOR_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The charge needs no stamina to start and spends none at once, since its stamina is drained as it plays
    chargedAttackStamina: 0,
    // Measured: gcsim v2.47.2 (MIT) razor/burst.go, the hit at 32 frames and the animation's 74. The wiki's Lightning Fang
    // Gives it 2U of Electro with no internal cooldown and 51.75 poise, blunt. Its sigils are cleared into energy after
    // The burst's cost is spent, and the Wolf Within stands from its hit
    elementalBurst: {
      hits: [
        {
          element: Element.Electro,
          gauge: 2,
          hitArea: LIGHTNING_FANG_HIT_AREA,
          hitmarkSeconds: LIGHTNING_FANG_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: 51.75,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      onStart: ({ body: { position }, combatant, kitEffectState }) => {
        const centre = { x: position.x, z: position.z };
        addKitEffect(kitEffectState, createElectroSigilClear(combatant, centre, LIGHTNING_FANG_SIGIL_CLEAR_FRAMES));
        addKitEffect(kitEffectState, createWolfWithin(combatant, centre));
      },
      seconds: 74 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) razor/skill.go, the press's hit at 32 frames and the animation's 74. The wiki's Claw
    // And Thunder gives it 2U of Electro with no internal cooldown and 140 poise. Its Electro Sigil is gained as it starts
    elementalSkill: {
      hits: [
        {
          element: Element.Electro,
          gauge: 2,
          hitArea: PRESS_HIT_AREA,
          hitmarkSeconds: 32 / 60,
          poiseDamage: 140,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      onStart: ({ combatant, kitEffectState }) => addElectroSigil(combatant.characterId, kitEffectState),
      seconds: 74 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) razor/skill.go, the hold's animation of 103 frames. The wiki's Claw and Thunder gives
    // It 2U of Electro with no internal cooldown and 300 poise, blunt, and the group its 10 second cooldown
    elementalSkillHolds: [
      {
        action: {
          hits: [
            {
              element: Element.Electro,
              gauge: 2,
              hitArea: HOLD_HIT_AREA,
              hitmarkSeconds: HOLD_HITMARK_FRAMES / 60,
              isBlunt: true,
              poiseDamage: 300,
              talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
            },
          ],
          onStart: ({ body: { position }, combatant, kitEffectState }) =>
            addKitEffect(
              kitEffectState,
              createElectroSigilClear(combatant, { x: position.x, z: position.z }, HOLD_HITMARK_FRAMES),
            ),
          seconds: 103 / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: getTalentMultiplier(talentMultiplierMap, RAZOR_SKILL_GROUP_ID, TALENT_START_LEVEL, 6),
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    getSkillCooldownMultiplier: ({ combatant }) =>
      combatant.ascension >= AWAKENING_ASCENSION ? AWAKENING_COOLDOWN_MULTIPLIER : 1,
    // Measured: gcsim v2.47.2 (MIT) razor/plunge.go, the low plunge at 44 frames and the high at 46, ending at 86 and
    // 87. The wiki's Steel Fang gives them 150 and 200 poise, both blunt
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 46 / 60,
          isBlunt: true,
          poiseDamage: 200,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
        },
      ],
      seconds: 87 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 44 / 60,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 86 / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 35, and it applies no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 35,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, RAZOR_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    // The group's, the wiki's and gcsim's 6 seconds for the press
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, RAZOR_SKILL_GROUP_ID, TALENT_START_LEVEL, 5),
  };
};
