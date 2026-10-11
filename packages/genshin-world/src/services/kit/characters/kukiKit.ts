import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import {
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  SUMMON_LINGER_SECONDS,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Kuki's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack's two slashes at 4 and 5 and its stamina at 6, and the plunges' collision, low and high at 7, 8 and 9. The skill
// Group holds Grass Ring of Sanctification's initial hit at 0, its tick's hit at 1, the flat part of its healing at 2, the
// Share of Max HP it heals at 3, its duration at 5 and its cooldown at 6. The burst group holds Gyoei Narukami Kariyama
// Rite's hit at 0, its cooldown at 5 and its energy cost at 6
const KUKI_ATTACK_GROUP_ID = 6531;
const KUKI_SKILL_GROUP_ID = 6532;
const KUKI_BURST_GROUP_ID = 6539;

// Measured: gcsim (MIT) kuki/attack.go, each strike's hitmark and the frame its action cancels at by default, and its reach
// From the body: a circle is its offset plus its radius, and the third strike is a box
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/kuki
const NORMAL_ATTACKS = [
  { cancelFrames: 23, hitArea: createFanReach(360, 1 + 1.5), hitmarkFrames: 12 },
  { cancelFrames: 27, hitArea: createFanReach(360, 0.6 + 1.5), hitmarkFrames: 13 },
  { cancelFrames: 50, hitArea: createBoxReach(-0.2, 6, 3.3), hitmarkFrames: 13 },
  { cancelFrames: 57, hitArea: createFanReach(360, 1.2 + 2.2), hitmarkFrames: 23 },
];

// Measured: gcsim (MIT) kuki/charge.go, the charged attack's two slashes at 14 and 25 frames, each a circle of radius 2.8
// Round the body, with its animation at 35 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/kuki
const CHARGED_ATTACK_FRAMES = 35;
const CHARGED_ATTACK_HITMARK_FRAMES = [14, 25];
const CHARGED_ATTACK_HIT_AREA = createFanReach(360, 2.8);

// Provisional: gcsim gives Kuki no plunge file, so her plunges take the reaches and poise the generic plunges of the kits
// Built beside hers take, until the Mac measures them
const PLUNGE_SECONDS = 0.4;
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1);
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 3);
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 5);
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;

// Measured: gcsim (MIT) kuki/skill.go, Grass Ring of Sanctification's initial hit at 11 frames, a circle of radius 4 round
// The body with 30 poise, in an animation of 52 frames. Its ring starts 23 frames in and ticks every 90 frames from then,
// Each tick's DMG landing 2 frames after it and its healing at it, for the table's seconds, 3 more from Constellation 2
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/kuki
const SKILL_FRAMES = 52;
const SKILL_HITMARK_FRAMES = 11;
const SKILL_POISE_DAMAGE = 30;
const SKILL_HIT_AREA = createFanReach(360, 4);
const RING_START_FRAMES = 23;
const RING_TICK_INTERVAL_FRAMES = 90;
const RING_TICK_HITMARK_FRAMES = 2;
const RING_CONSTELLATION = 2;
const RING_CONSTELLATION_SECONDS = 3;
// Measured: gcsim (MIT) kuki/skill.go, Kuki drains 30% of her current HP as she casts, but no further than to 20% of her
// Max HP. Her HP is a party member's health share, so the drain reads it at the cast's first step
const HP_DRAIN_SHARE = 0.3;
const HP_DRAIN_FLOOR_SHARE = 0.2;
// Measured: gcsim (MIT) kuki/asc.go, from Ascension 4 the ring's healing is raised by 75% of Elemental Mastery and its tick's
// DMG by 25% of it, and the initial hit's DMG by 25% of it at every ascension
const ASCENSION_4 = 4;
const ASCENSION_4_HEALING_ELEMENTAL_MASTERY_SHARE = 0.75;
const ASCENSION_4_DAMAGE_ELEMENTAL_MASTERY_SHARE = 0.25;
const INITIAL_HIT_ELEMENTAL_MASTERY_SHARE = 0.25;

// Measured: gcsim (MIT) kuki/burst.go, Gyoei Narukami Kariyama Rite's animation at 63 frames, and its hits from 50 frames
// Every 17, which is 2 * 60 / 7 in gcsim's integer maths, each a circle of radius 4 on the primary target, so that its
// Hits are priced as a circle of the targeting reach plus its own. Constellation 1 makes that radius 6
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/kuki
const BURST_FRAMES = 63;
const BURST_FIRST_HITMARK_FRAMES = 50;
const BURST_HIT_INTERVAL_FRAMES = 17;
// Provisional: gcsim casts 12 hits while her HP is at 50% or less, which a kit with no current HP cannot tell, so the
// Healthy count of 7 stands until the Mac measures it
const BURST_HIT_COUNT = 7;
const BURST_HIT_RADIUS = 4;
const BURST_CONSTELLATION = 1;
const BURST_CONSTELLATION_HIT_RADIUS = 6;

export const KUKI_CHARACTER_ID = 10_000_065;

const getElementalMastery = ({ attributes }: Combatant): number =>
  attributes.attributeTotalMap[Attribute.ElementalMastery];

// Kuki's first kit, at talent level 1: four strikes, a charged attack of two slashes, a collision and two plunges, Grass
// Ring of Sanctification with its ring and the ring's Ascension 4 bonuses, and Gyoei Narukami Kariyama Rite's seven hits.
// Constellations 1 and 2 are built. Her Ascension 1 healing bonus, and Constellations 4 and 6, are not, as each reads her HP
export const createKukiKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KUKI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KUKI_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KUKI_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames }, index): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(index),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const chargedAttackHits: KitHit[] = CHARGED_ATTACK_HITMARK_FRAMES.map((frames, index) => ({
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: frames / 60,
    poiseDamage: 0,
    talentMultiplier: attackTalentMultiplier(4 + index),
  }));

  const createPlunge = (hitArea: AttackArea, poiseDamage: number, index: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, poiseDamage, talentMultiplier: attackTalentMultiplier(index) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  // The ring's first tick lands 90 frames after its start, and each tick's DMG and healing reads the ring's caster as it
  // Stood at the cast, with its heal from the caster's Max HP and its Elemental Mastery at Ascension 4
  const createRing = (body: KitBody, combatant: Combatant): KitField => {
    const ringTickHit: KitHit = {
      additiveBaseDamageBonus: (striker) =>
        striker.ascension >= ASCENSION_4
          ? ASCENSION_4_DAMAGE_ELEMENTAL_MASTERY_SHARE * getElementalMastery(striker)
          : 0,
      element: Element.Electro,
      gauge: 1,
      hitArea: SKILL_HIT_AREA,
      hitmarkSeconds: RING_TICK_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: skillTalentMultiplier(1),
    };
    const ringSeconds =
      getTalentMultiplier(talentMultiplierMap, KUKI_SKILL_GROUP_ID, TALENT_START_LEVEL, 5) +
      (combatant.constellationCount >= RING_CONSTELLATION ? RING_CONSTELLATION_SECONDS : 0);
    return {
      centre: { x: body.position.x, z: body.position.z },
      characterId: combatant.characterId,
      kind: "field",
      nextTickSeconds: (RING_START_FRAMES + RING_TICK_INTERVAL_FRAMES) / 60,
      onTick: ({ activeCombatant, kitEffectState, party }) => {
        const ascensionHealing =
          combatant.ascension >= ASCENSION_4
            ? ASCENSION_4_HEALING_ELEMENTAL_MASTERY_SHARE * getElementalMastery(combatant)
            : 0;
        healPartyMember(
          party,
          activeCombatant.characterId,
          (skillTalentMultiplier(3) * combatant.attributes.maxHealth + skillTalentMultiplier(2) + ascensionHealing) /
            activeCombatant.attributes.maxHealth,
        );
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [ringTickHit]));
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: RING_START_FRAMES / 60 + ringSeconds + SUMMON_LINGER_SECONDS,
      tickIndex: 0,
      tickIntervalSeconds: RING_TICK_INTERVAL_FRAMES / 60,
    };
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(5),
    burstEnergyCost: burstTalentMultiplier(6),
    chargedAttack: {
      hits: chargedAttackHits,
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(6),
    elementalBurst: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        const radius =
          combatant.constellationCount >= BURST_CONSTELLATION ? BURST_CONSTELLATION_HIT_RADIUS : BURST_HIT_RADIUS;
        const hits: KitHit[] = Array.from({ length: BURST_HIT_COUNT }, (_hit, index) => ({
          additiveBaseDamageBonus: createMaxHealthScaledBonus(burstTalentMultiplier(0)),
          element: Element.Electro,
          gauge: 1,
          hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, radius),
          hitmarkSeconds: (BURST_FIRST_HITMARK_FRAMES + index * BURST_HIT_INTERVAL_FRAMES) / 60,
          poiseDamage: 0,
          talentMultiplier: 0,
        }));
        addKitEffect(kitEffectState, createKitSummon(body, combatant, hits));
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          additiveBaseDamageBonus: (striker: Combatant) =>
            INITIAL_HIT_ELEMENTAL_MASTERY_SHARE * getElementalMastery(striker),
          element: Element.Electro,
          gauge: 1,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: SKILL_POISE_DAMAGE,
          talentMultiplier: skillTalentMultiplier(0),
        },
      ],
      onStart: ({ body, combatant, kitEffectState }) => {
        const { characterId } = combatant;
        // The cast's drain runs once, on the field's first tick, as the interval is past the field's life
        const drain: KitField = {
          centre: { x: body.position.x, z: body.position.z },
          characterId,
          kind: "field",
          nextTickSeconds: 0,
          onTick: ({ party }) => {
            const { healthShare } = getPartyMember(party, characterId);
            if (healthShare <= HP_DRAIN_FLOOR_SHARE) return;
            damagePartyMember(
              party,
              characterId,
              Math.min(healthShare * HP_DRAIN_SHARE, healthShare - HP_DRAIN_FLOOR_SHARE),
            );
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining: SUMMON_LINGER_SECONDS,
          tickIndex: 0,
          tickIntervalSeconds: 1,
        };
        addKitEffect(kitEffectState, drain);
        addKitEffect(kitEffectState, createRing(body, combatant));
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: createPlunge(HIGH_PLUNGE_HIT_AREA, HIGH_PLUNGE_POISE_DAMAGE, 9),
    lowPlunge: createPlunge(LOW_PLUNGE_HIT_AREA, LOW_PLUNGE_POISE_DAMAGE, 8),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(7),
    },
    skillCooldownSeconds: skillTalentMultiplier(6),
  };
};
