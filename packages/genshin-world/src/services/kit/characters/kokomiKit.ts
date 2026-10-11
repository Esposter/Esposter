import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Kokomi's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack at 3 and its flat stamina at 4, and the plunges' collision, low and high at 5, 6 and 7. The skill group holds
// Bake-Kurage's heal as its share of Max HP at 0 and its flat part at 1, its ripple at 2, its seconds at 3 and its cooldown
// At 4. The burst group holds Nereid's Ascension's damage as a share of Max HP at 0, the Ceremonial Garment's heal per hit
// As its share of Max HP at 1 and its flat part at 2, the Max HP bonuses of the normal, charged and Bake-Kurage attacks at 3,
// 4 and 8, then its seconds, cooldown and energy cost at 5, 6 and 7
const KOKOMI_ATTACK_GROUP_ID = 5431;
const KOKOMI_SKILL_GROUP_ID = 5432;
const KOKOMI_BURST_GROUP_ID = 5439;

// Measured: gcsim (MIT) kokomi/attack.go, each strike's cancel frames, and its hit at its hitmark plus the ten frames its
// Projectile travels. gcsim gives the strikes no poise, and each is a circle on the primary target, so its reach is the
// Targeting's, as the other targeted strikes' are
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/attack.go
const PROJECTILE_TRAVEL_FRAMES = 10;
const NORMAL_ATTACKS = [
  { cancelFrames: 30, hitmarkFrames: 2, talentIndex: 0 },
  { cancelFrames: 34, hitmarkFrames: 9, talentIndex: 1 },
  { cancelFrames: 65, hitmarkFrames: 26, talentIndex: 2 },
];

// Measured: gcsim (MIT) kokomi/charge.go, the charged attack's hit at 48 frames of its 76-frame animation, on the primary
// Target, which the garment widens. Its reach is the targeting's too
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/charge.go
const CHARGED_ATTACK_FRAMES = 76;
const CHARGED_ATTACK_HITMARK_FRAMES = 48;

// Provisional: gcsim gives Kokomi no plunge, so her plunges' circles are the reaches the other kits' plunges use, a metre
// Apart from one another, until the Mac measures them. Their hitmarks are provisional too
const PLUNGE_COLLISION_REACH = createFanReach(360, 2);
const LOW_PLUNGE_REACH = createFanReach(360, 4);
const HIGH_PLUNGE_REACH = createFanReach(360, 6);
const PLUNGE_HITMARK_SECONDS = 0.5;
const PLUNGE_SECONDS = 1;

// Measured: gcsim (MIT) kokomi/skill.go, Bake-Kurage's seven ticks, the first at 24 frames and the rest every 120 frames
// From 150, on a circle of radius 6 whose centre lies 3 metres ahead, which is the reach of each ripple. Its heal lands on
// The active character while it stands within that circle, every tick, for 12.5 seconds, on a cooldown of 20 seconds
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/skill.go
const SKILL_FRAMES = 61;
const SKILL_FIRST_TICK_FRAMES = 24;
const SKILL_SECOND_TICK_FRAMES = 150;
const SKILL_TICK_INTERVAL_FRAMES = 120;
const SKILL_TICK_COUNT = 7;
const SKILL_DURATION_SECONDS = 12.5;
const SKILL_CENTRE_METRES = 3;
const SKILL_RADIUS = 6;
const SKILL_REACH = createFanReach(360, SKILL_CENTRE_METRES + SKILL_RADIUS);

// Measured: gcsim (MIT) kokomi/burst.go, Nereid's Ascension's hit at 49 frames of its 78-frame animation, a circle of radius
// 5 round the body. Ceremonial Garment lasts ten seconds, and the kit plays its garment actions in place of its own while it
// Lasts, which carry the Max HP bonuses and the heal on each normal and charged attack
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/burst.go
const BURST_FRAMES = 78;
const BURST_HITMARK_FRAMES = 49;
const BURST_REACH = createFanReach(360, 5);
const BURST_GAUGE = 2;
const GARMENT_SECONDS = 10;

export const KOKOMI_CHARACTER_ID = 10_000_054;

// The burst's energy cost is the table's 70, which gcsim's EnergyMax gives too, and the charged attack's stamina is the
// Table's flat value in its slot
export const createKokomiKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KOKOMI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KOKOMI_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KOKOMI_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // The garment's heal is a share of Max HP and a flat amount to every member, rolled whether or not the striker holds a
  // Shield, as gcsim's heal on each normal and charged attack is
  const garmentHeal: KitPartyHeal = {
    chance: () => 1,
    defenseShare: 0,
    flatHealth: burstTalentMultiplier(2),
    isUnshielded: true,
    maxHealthShare: burstTalentMultiplier(1),
  };

  // A strike's hit: its Max HP bonus and heal are only in the garment's, so the base kit's attacks carry neither
  const createAttackHit = (
    hitmarkSeconds: number,
    talentMultiplier: number,
    garmentBonusIndex: number,
    isInGarment: boolean,
  ): KitHit => ({
    element: Element.Hydro,
    gauge: 1,
    hitArea: STRIKE_TARGETING_AREA,
    hitmarkSeconds,
    poiseDamage: 0,
    talentMultiplier,
    ...(isInGarment && {
      additiveBaseDamageBonus: createMaxHealthScaledBonus(burstTalentMultiplier(garmentBonusIndex)),
      healParty: garmentHeal,
    }),
  });

  const createNormalAttacks = (isInGarment: boolean): KitAction[] =>
    NORMAL_ATTACKS.map(({ cancelFrames, hitmarkFrames, talentIndex }): KitAction => ({
      hits: [
        createAttackHit(
          (hitmarkFrames + PROJECTILE_TRAVEL_FRAMES) / 60,
          attackTalentMultiplier(talentIndex),
          3,
          isInGarment,
        ),
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }));

  const createChargedAttack = (isInGarment: boolean): KitAction => ({
    hits: [createAttackHit(CHARGED_ATTACK_HITMARK_FRAMES / 60, attackTalentMultiplier(3), 4, isInGarment)],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  // Bake-Kurage is a summon of its seven ripples where Kokomi casts it, and a field of its heal over the circle they reach,
  // Which heals the active character from the cast's Max HP while it stands in the circle. In the garment its ripples gain
  // The Max HP bonus as well
  const createSkill = (isInGarment: boolean): KitAction => {
    const tickHits = Array.from({ length: SKILL_TICK_COUNT }, (_tick, index): KitHit => {
      const hitmarkFrames =
        index === 0 ? SKILL_FIRST_TICK_FRAMES : SKILL_SECOND_TICK_FRAMES + SKILL_TICK_INTERVAL_FRAMES * (index - 1);
      return {
        element: Element.Hydro,
        gauge: 1,
        hitArea: SKILL_REACH,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: skillTalentMultiplier(2),
        ...(isInGarment && { additiveBaseDamageBonus: createMaxHealthScaledBonus(burstTalentMultiplier(8)) }),
      };
    });
    return {
      hits: [],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { maxHealth } = combatant.attributes;
        castKitSummon(kitEffectState, body, combatant, tickHits, { secondsRemaining: SKILL_DURATION_SECONDS });
        const centre = createAheadBody(body, SKILL_CENTRE_METRES).position;
        addKitEffect(kitEffectState, {
          centre: { x: centre.x, z: centre.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: SKILL_FIRST_TICK_FRAMES / 60,
          onTick: ({ activeCombatant, party }) =>
            healPartyMember(
              party,
              activeCombatant.characterId,
              (skillTalentMultiplier(0) * maxHealth + skillTalentMultiplier(1)) / activeCombatant.attributes.maxHealth,
            ),
          radius: SKILL_RADIUS,
          secondsRemaining: SKILL_DURATION_SECONDS,
          tickIndex: 0,
          tickIntervalSeconds: SKILL_TICK_INTERVAL_FRAMES / 60,
        });
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    };
  };

  const garmentNormalAttacks = createNormalAttacks(true);
  const garmentChargedAttack = createChargedAttack(true);
  const garmentSkill = createSkill(true);
  const chargedAttackStamina = attackTalentMultiplier(4);

  // Nereid's Ascension strikes the enemies round the body for its share of Max HP, then robes Kokomi in the garment, a
  // Stance of her own that replaces her normal attacks, charged attack and Bake-Kurage while it lasts
  const elementalBurst: KitAction = {
    hits: [
      {
        additiveBaseDamageBonus: createMaxHealthScaledBonus(burstTalentMultiplier(0)),
        element: Element.Hydro,
        gauge: BURST_GAUGE,
        hitArea: BURST_REACH,
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: 0,
      },
    ],
    // The garment's normal attacks are Normal Attack DMG and its charged attack Charged Attack DMG, gcsim's AttackTagNormal
    // In kokomi/attack.go and AttackTagExtra in kokomi/charge.go; its Bake-Kurage is Elemental Skill DMG in skill.go
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      enterKitStance(
        kitEffectState,
        combatant,
        {
          chargedAttack: garmentChargedAttack,
          chargedAttackStamina,
          elementalBurst,
          elementalSkill: garmentSkill,
          normalAttacks: garmentNormalAttacks,
        },
        GARMENT_SECONDS,
      ),
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(6),
    burstEnergyCost: burstTalentMultiplier(7),
    chargedAttack: createChargedAttack(false),
    chargedAttackStamina,
    elementalBurst,
    elementalSkill: createSkill(false),
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_REACH,
          hitmarkSeconds: PLUNGE_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(7),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_REACH,
          hitmarkSeconds: PLUNGE_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: createNormalAttacks(false),
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_REACH,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(5),
    },
    skillCooldownSeconds: skillTalentMultiplier(4),
  };
};
