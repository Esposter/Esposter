import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSkillHold } from "#src/models/kit/KitSkillHold";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Sayu's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 4, the charged
// Attack's two hits at 5 and 6 and its flat stamina at 7, and the plunges' collision, low and high at 9, 10 and 11. The
// Skill group holds the press's Windwheel at 0, its kick at 2, the hold's kick at 3, the seconds a hold may last at 5, and
// Its cooldown at 6. The burst group holds Mujina Flurry's damage at 0, its heal at 1 and 2, the Daruma's damage at 3 and
// Its heal at 4 and 5, then its seconds, cooldown and energy cost at 6, 7 and 8
const SAYU_ATTACK_GROUP_ID = 5331;
const SAYU_SKILL_GROUP_ID = 5332;
const SAYU_BURST_GROUP_ID = 5339;

// Measured: gcsim (MIT) sayu/attack.go, each strike's hitmarks, cancel frames, poise and reach. A box is priced to its far
// Corner, and a circle as its offset plus its radius, as the other kits price them
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/sayu/attack.go
const createOffsetReach = (offset: number, radius: number) => createFanReach(360, offset + radius);
const FIRST_STRIKE_REACH = createBoxReach(-0.7, 2.5, 3.2);
const SECOND_STRIKE_REACH = createOffsetReach(0.5, 2);
const THIRD_STRIKE_BOX_REACH = createBoxReach(-1, 2.5, 3.5);
const THIRD_STRIKE_CIRCLE_REACH = createOffsetReach(0.5, 2);
const FOURTH_STRIKE_REACH = createBoxReach(-2, 2.8, 4.5);
const NORMAL_ATTACKS = [
  { cancelFrames: 36, hits: [{ hitmarkFrames: 23, poiseDamage: 80.5, reach: FIRST_STRIKE_REACH, talentIndex: 0 }] },
  { cancelFrames: 48, hits: [{ hitmarkFrames: 29, poiseDamage: 79.35, reach: SECOND_STRIKE_REACH, talentIndex: 1 }] },
  {
    cancelFrames: 52,
    hits: [
      { hitmarkFrames: 14, poiseDamage: 48.3, reach: THIRD_STRIKE_BOX_REACH, talentIndex: 2 },
      { hitmarkFrames: 26, poiseDamage: 48.3, reach: THIRD_STRIKE_CIRCLE_REACH, talentIndex: 3 },
    ],
  },
  { cancelFrames: 71, hits: [{ hitmarkFrames: 35, poiseDamage: 109.71, reach: FOURTH_STRIKE_REACH, talentIndex: 4 }] },
];

// Provisional: gcsim gives Sayu no charged attack, its CA-Spinning hitbox being unimplemented, so its two hits are read at
// The table's charged slots, landing at half a second and a second and ending at 1.2 seconds, as the other kits' charged
// Attacks do, until the Mac measures them. Its stamina is the table's flat value in the same slot
const CHARGED_FIRST_HITMARK_SECONDS = 0.5;
const CHARGED_FINAL_HITMARK_SECONDS = 1;
const CHARGED_ATTACK_SECONDS = 1.2;

// Provisional: gcsim gives Sayu no plunge either, so her plunges' circles are the reaches the other kits' plunges use, a
// Metre apart from one another, until the Mac measures them. Their hitmarks are provisional too
const PLUNGE_COLLISION_REACH = createOffsetReach(1, 1);
const LOW_PLUNGE_REACH = createOffsetReach(1, 3);
const HIGH_PLUNGE_REACH = createOffsetReach(1, 5);
const PLUNGE_HITMARK_SECONDS = 0.5;
const PLUNGE_SECONDS = 1;

// Measured: gcsim (MIT) sayu/skill.go, Fuufuu Windwheel's DoT ticks on a circle of radius 3 round the body, and the kick
// Circles of radius 2.5 and 3 offset half a metre ahead. The press's DoT lands at 7 frames, its kick at 25 and its animation
// Is 45, the short hold's DoT at 18, its kick at 48 and its animation 89, and its cooldown 372 frames
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/sayu/skill.go
const DOT_REACH = createFanReach(360, 3);
const PRESS_KICK_REACH = createOffsetReach(0.5, 2.5);
const HOLD_KICK_REACH = createOffsetReach(0.5, 3);
const PRESS_DOT_HITMARK_FRAMES = 7;
const PRESS_KICK_HITMARK_FRAMES = 25;
const PRESS_FRAMES = 45;
const SHORT_HOLD_DOT_HITMARK_FRAMES = 18;
const SHORT_HOLD_KICK_HITMARK_FRAMES = 48;
const SHORT_HOLD_FRAMES = 89;
const SHORT_HOLD_COOLDOWN_SECONDS = 372 / 60;
// Provisional: no table or wiki page gives the seconds a press must be held to become a hold, so it is 0.5 seconds as
// Venti's is, until a recording measures it
const SHORT_HOLD_MINIMUM_HELD_SECONDS = 0.5;
// A hold rolls for the seconds it is held, up to its maximum. gcsim's roll is its frames, so each whole second held is a
// Level of its own, its DoT ticks every half a second from 18 frames, its kick at 67 frames past the roll and its animation
// 109 frames past it. Its cooldown is the table's base, which a roll's half second per held second adds to
const ROLL_DOT_HITMARK_FRAMES = 18;
const ROLL_DOT_INTERVAL_FRAMES = 30;
const ROLL_KICK_HITMARK_FRAMES = 67;
const ROLL_FRAMES = 109;
const ROLL_COOLDOWN_SECONDS_PER_HELD_SECOND = 0.5;
const ROLL_MAXIMUM_SECONDS = 10;

// Measured: gcsim (MIT) sayu/burst.go, Mujina Flurry's hit at 12 frames on a circle of radius 4.5 a metre and a half ahead,
// And its animation of 65 frames. Muji-Muji Daruma is a field of radius 10 the same distance ahead, which ticks from 145
// Frames every 90 for six ticks, each a strike on the nearest enemy in it and a heal of the active character at 70% HP or
// Under. The Daruma's strike is a summon here, its every tick striking whatever is in reach, as gcsim strikes one enemy
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/sayu/burst.go
const BURST_HITMARK_FRAMES = 12;
const BURST_FRAMES = 65;
const BURST_FIELD_CENTRE_METRES = 1.5;
const BURST_FIELD_RADIUS = 10;
const BURST_INITIAL_REACH = createOffsetReach(1.5, 4.5);
const BURST_TICK_REACH = createOffsetReach(1.5, BURST_FIELD_RADIUS);
const BURST_TICK_FIRST_FRAMES = 145;
const BURST_TICK_INTERVAL_FRAMES = 90;
const BURST_TICK_COUNT = 6;
const BURST_HEAL_HP_SHARE = 0.7;

// Sayu's first kit, at talent level 1: four strikes, a charged attack of two hits, a collision and two plunges, Fuufuu
// Windwheel's press, its short hold and its roll of up to ten seconds, and Yoohoo Art: Mujina Flurry with Muji-Muji Daruma.
// Her passives and constellations are not built, as no kit event reaches a value the fetched sources give. The roll's
// Elemental kick, which takes the element a roll absorbs, is not built, as the kit has no absorption check to read it
export const createSayuKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SAYU_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SAYU_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SAYU_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // Sayu's strikes are blunt Physical hits, which carry no element or gauge
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ cancelFrames, hits }): KitAction => ({
    hits: hits.map(({ hitmarkFrames, poiseDamage, reach, talentIndex }): KitHit => ({
      hitArea: reach,
      hitmarkSeconds: hitmarkFrames / 60,
      isBlunt: true,
      poiseDamage,
      talentMultiplier: attackTalentMultiplier(talentIndex),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  // The Windwheel's DoT and the kick, each Anemo at 1U as gcsim's durabilities of 25 give them
  const dotHit = (hitmarkFrames: number, talentIndex: number): KitHit => ({
    element: Element.Anemo,
    gauge: 1,
    hitArea: DOT_REACH,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(talentIndex),
  });
  const kickHit = (hitArea: KitHit["hitArea"], hitmarkFrames: number, talentIndex: number): KitHit => ({
    element: Element.Anemo,
    gauge: 1,
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(talentIndex),
  });

  const pressAction: KitAction = {
    hits: [dotHit(PRESS_DOT_HITMARK_FRAMES, 0), kickHit(PRESS_KICK_REACH, PRESS_KICK_HITMARK_FRAMES, 2)],
    seconds: PRESS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const shortHold: KitSkillHold = {
    action: {
      hits: [dotHit(SHORT_HOLD_DOT_HITMARK_FRAMES, 0), kickHit(HOLD_KICK_REACH, SHORT_HOLD_KICK_HITMARK_FRAMES, 3)],
      seconds: SHORT_HOLD_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    cooldownSeconds: SHORT_HOLD_COOLDOWN_SECONDS,
    minimumHeldSeconds: SHORT_HOLD_MINIMUM_HELD_SECONDS,
  };

  // Each level of the roll is the roll held for that many whole seconds: a DoT tick every half second from its start, the
  // Kick at its end, and its cooldown the table's base plus half a second for each second held
  const createRollHold = (heldSeconds: number): KitSkillHold => {
    const rollFrames = heldSeconds * 60;
    const tickCount = Math.floor(rollFrames / ROLL_DOT_INTERVAL_FRAMES) + 1;
    const dotHits = Array.from({ length: tickCount }, (_tick, index) =>
      dotHit(ROLL_DOT_HITMARK_FRAMES + index * ROLL_DOT_INTERVAL_FRAMES, 0),
    );
    return {
      action: {
        hits: [...dotHits, kickHit(HOLD_KICK_REACH, ROLL_KICK_HITMARK_FRAMES + rollFrames, 3)],
        seconds: (ROLL_FRAMES + rollFrames) / 60,
        targetingArea: SKILL_TARGETING_AREA,
      },
      cooldownSeconds: skillTalentMultiplier(6) + heldSeconds * ROLL_COOLDOWN_SECONDS_PER_HELD_SECOND,
      minimumHeldSeconds: heldSeconds,
    };
  };
  const rolls: KitSkillHold[] = Array.from({ length: ROLL_MAXIMUM_SECONDS }, (_roll, index) =>
    createRollHold(index + 1),
  );

  // Mujina Flurry's heal and Muji-Muji Daruma's heal are each a flat amount and a share of Sayu's ATK, read at the cast
  const burstInitialHealFlat = burstTalentMultiplier(1);
  const burstInitialHealAttackShare = burstTalentMultiplier(2);
  const burstTickHealFlat = burstTalentMultiplier(4);
  const burstTickHealAttackShare = burstTalentMultiplier(5);

  return {
    burstCooldownSeconds: burstTalentMultiplier(7),
    burstEnergyCost: burstTalentMultiplier(8),
    chargedAttack: {
      hits: [
        {
          hitArea: STRIKE_TARGETING_AREA,
          hitmarkSeconds: CHARGED_FIRST_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(5),
        },
        {
          hitArea: STRIKE_TARGETING_AREA,
          hitmarkSeconds: CHARGED_FINAL_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(7),
    elementalBurst: {
      hits: [
        {
          element: Element.Anemo,
          gauge: 1,
          hitArea: BURST_INITIAL_REACH,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      // The initial heal lands at the cast, on the active character, from the ATK the cast reads, and the Daruma is a field
      // Of its ticks, each a strike and a heal, cast where Sayu stands and priced by her as she stood then
      onStart: ({ body, combatant, kitEffectState }) => {
        const atk = combatant.attributes.attack;
        const initialHeal = burstInitialHealFlat + atk * burstInitialHealAttackShare;
        addKitEffect(kitEffectState, {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: 0,
          onTick: ({ activeCombatant, party }) =>
            healPartyMember(party, activeCombatant.characterId, initialHeal / activeCombatant.attributes.maxHealth),
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining: 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
        const tickHits = Array.from({ length: BURST_TICK_COUNT }, (_tick, index): KitHit => ({
          element: Element.Anemo,
          gauge: 1,
          hitArea: BURST_TICK_REACH,
          hitmarkSeconds: (BURST_TICK_FIRST_FRAMES + index * BURST_TICK_INTERVAL_FRAMES) / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(3),
        }));
        addKitEffect(kitEffectState, createKitSummon(body, combatant, tickHits));
        const ahead = createAheadBody(body, BURST_FIELD_CENTRE_METRES);
        addKitEffect(kitEffectState, {
          centre: { x: ahead.position.x, z: ahead.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: BURST_TICK_FIRST_FRAMES / 60,
          onTick: ({ activeCombatant, party }) => {
            if (getPartyMember(party, activeCombatant.characterId).healthShare > BURST_HEAL_HP_SHARE) return;
            const tickHeal = burstTickHealFlat + atk * burstTickHealAttackShare;
            healPartyMember(party, activeCombatant.characterId, tickHeal / activeCombatant.attributes.maxHealth);
          },
          radius: BURST_FIELD_RADIUS,
          secondsRemaining: (BURST_TICK_FIRST_FRAMES + BURST_TICK_INTERVAL_FRAMES * BURST_TICK_COUNT) / 60,
          tickIndex: 0,
          tickIntervalSeconds: BURST_TICK_INTERVAL_FRAMES / 60,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: pressAction,
    elementalSkillHolds: [shortHold, ...rolls],
    elementalSkillMaximumHeldSeconds: ROLL_MAXIMUM_SECONDS,
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_REACH,
          hitmarkSeconds: PLUNGE_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(11),
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
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_REACH,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(9),
    },
    skillCooldownSeconds: skillTalentMultiplier(6),
  };
};
