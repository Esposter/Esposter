import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Charlotte's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack at 3 and its flat stamina at 4, the plunges' collision, low and high at 5, 6 and 7, and Spiritbreath Thorn's
// Multiplier at 8 and its internal cooldown in seconds at 9. The skill group holds Framing's press at 0, its hold at 1, the
// Snappy Silhouette mark at 2, the Focused Impression mark at 5, the press's cooldown at 7 and the hold's at 9. The burst
// Group holds Still Photo's cast heal as a share of ATK at 0 and its flat HP at 1, its hit at 2, Kamera's regeneration as a
// Share of ATK at 3 and its flat HP at 4, Kamera's tick at 5, its cooldown at 7 and its energy cost at 8
const CHARLOTTE_ATTACK_GROUP_ID = 8831;
const CHARLOTTE_SKILL_GROUP_ID = 8832;
const CHARLOTTE_BURST_GROUP_ID = 8839;

export const CHARLOTTE_CHARACTER_ID = 10_000_088;

// Measured: gcsim (MIT) charlotte/attack.go, each strike's hitmark, the frame its action cancels at by default to walking,
// And its circle of radius 1, 1 and 2 round the primary target
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const NORMAL_ATTACKS = [
  { cancelFrames: 32, hitmarkFrames: 13, radius: 1, talentIndex: 0 },
  { cancelFrames: 45, hitmarkFrames: 25, radius: 1, talentIndex: 1 },
  { cancelFrames: 74, hitmarkFrames: 31, radius: 2, talentIndex: 2 },
];

// Measured: gcsim (MIT) charlotte/charge.go, the charged attack's circle of radius 2.5 round the primary target at 67 frames of
// Its 84-frame animation. Spiritbreath Thorn strikes 30 frames after it, a circle of radius 2.5 round the target's position at
// That moment, and its cooldown of six seconds starts when it strikes
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const CHARGED_ATTACK_FRAMES = 84;
const CHARGED_ATTACK_HITMARK_FRAMES = 67;
const CHARGED_ATTACK_RADIUS = 2.5;
const THORN_DELAY_FRAMES = 30;
const THORN_RADIUS = 2.5;
const THORN_HITMARK_SECONDS = (CHARGED_ATTACK_HITMARK_FRAMES + THORN_DELAY_FRAMES) / 60;
// One frame after the step that opens the cooldown, as Blood Blossom's hit lands from its own summon
const SAME_FRAME_HITMARK_SECONDS = 1 / 60;
const THORN_COOLDOWN_STATUS_ID = "charlotte-thorn-cooldown";

// Measured: gcsim (MIT) charlotte/plunge.go, the low plunge at 44 frames of its 65-frame animation and a circle of radius 3
// Round the body, the high at 46 of 67 and a circle of radius 3.5, and the collision at 38 frames and a circle of radius 1.5.
// Gcsim gives the plunges no poise, so each deals none until the wiki's Advanced properties are measured
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const LOW_PLUNGE_FRAMES = 65;
const LOW_PLUNGE_HITMARK_FRAMES = 44;
const LOW_PLUNGE_RADIUS = 3;
const HIGH_PLUNGE_FRAMES = 67;
const HIGH_PLUNGE_HITMARK_FRAMES = 46;
const HIGH_PLUNGE_RADIUS = 3.5;
const PLUNGE_COLLISION_HITMARK_FRAMES = 38;
const PLUNGE_COLLISION_RADIUS = 1.5;
const NO_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) charlotte/skill.go, Framing's press at 31 frames of its 49-frame animation, a box 4 metres wide and 8
// Long from the body, which marks each enemy it strikes with Snappy Silhouette for 6.8 seconds, ticking every 1.5 seconds
// From the mark, and no more than five enemies a cast. Its tick is a single-target hit
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const SKILL_PRESS_FRAMES = 49;
const SKILL_PRESS_HITMARK_FRAMES = 31;
const SKILL_PRESS_HIT_AREA = createBoxReach(0, 4, 8);
const SNAPPY_MARK_STATUS_ID = "charlotte-snappy-silhouette";
const SNAPPY_MARK_SECONDS = (360 + 0.8 * 60) / 60;
const SNAPPY_MARK_INTERVAL_SECONDS = 1.5;
const SNAPPY_MARK_CAP = 5;
const SINGLE_TARGET_HIT_AREA = createCircleReach(0, 0);

// Measured: gcsim (MIT) charlotte/burst.go, Still Photo's animation at 70 frames and its circle of radius 6, 4.5 metres ahead of
// The body, struck at 53 frames. The cast heals every member of the party as it lands. Kamera strikes the same circle eight
// Times, at the frames below, and each tick heals the character on the field while it stands within a circle of radius 7 round
// The point the burst was cast at. Ticks are priced from the caster's ATK when cast
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const BURST_FRAMES = 70;
const BURST_HITMARK_FRAMES = 53;
const BURST_OFFSET_METRES = 4.5;
const BURST_RADIUS = 6;
const BURST_HIT_AREA = createCircleReach(BURST_OFFSET_METRES, BURST_RADIUS);
const BURST_HEAL_RADIUS = 7;
const BURST_GAUGE = 2;
const KAMERA_TICK_FRAMES = [95, 119, 143, 166, 179, 203, 226, 249];

// The mark Framing's press puts on each enemy it strikes, ticking every interval from the mark
const createSnappyMark = (): EnemyStatus => ({
  damageTakenBonus: 0,
  id: SNAPPY_MARK_STATUS_ID,
  nextTickSeconds: SNAPPY_MARK_INTERVAL_SECONDS,
  secondsRemaining: SNAPPY_MARK_SECONDS,
  tickIntervalSeconds: SNAPPY_MARK_INTERVAL_SECONDS,
});

const healTeam = (context: KitContext, caster: Combatant, flatHealth: number, attackShare: number): void => {
  const healedHealth = flatHealth + attackShare * caster.attributes.attack;
  for (const characterId of getDeployedCharacterIds(context.party))
    changeKitMemberHealth(context, caster, characterId, healedHealth);
};

export const createCharlotteKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHARLOTTE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHARLOTTE_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CHARLOTTE_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // The marks Framing's press puts on the enemies it strikes: a cast marks the first five, and a tick is a hit on that enemy
  // Alone. The count is reset as each press starts, so it counts the enemies of the press that is landing
  let markedCount = 0;
  const snappyMarkHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: SINGLE_TARGET_HIT_AREA,
    hitmarkSeconds: SAME_FRAME_HITMARK_SECONDS,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(2),
  };

  const createNormalAttacks = (): KitAction[] =>
    NORMAL_ATTACKS.map(({ cancelFrames, hitmarkFrames, radius, talentIndex }): KitAction => ({
      hits: [
        {
          element: Element.Cryo,
          gauge: 1,
          hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, radius),
          hitmarkSeconds: hitmarkFrames / 60,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(talentIndex),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }));

  // Spiritbreath Thorn is opened as the charged attack starts on a target, and its field strikes 30 frames after the charged
  // Attack's hit, where the target stood then, unless the thorn is still on its six-second cooldown
  const chargedAttack: KitAction = {
    hits: [
      {
        element: Element.Cryo,
        gauge: 1,
        hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, CHARGED_ATTACK_RADIUS),
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(3),
      },
    ],
    onStart: ({ activeCombatant: combatant, kitEffectState }, target) => {
      if (!target) return;
      const { characterId } = combatant;
      const { position } = target;
      const thornHit: KitHit = {
        element: Element.Cryo,
        hitArea: createCircleReach(0, THORN_RADIUS),
        hitmarkSeconds: SAME_FRAME_HITMARK_SECONDS,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(8),
      };
      const thornBody: KitBody = { facing: 0, height: 0, position: { x: position.x, z: position.z } };
      scheduleKitTask(kitEffectState, characterId, THORN_HITMARK_SECONDS, ({ kitEffectState: effectState }) => {
        if (!startKitCooldown(effectState, characterId, THORN_COOLDOWN_STATUS_ID, attackMultiplier(9))) return;
        castKitSummon(effectState, thornBody, combatant, [thornHit]);
      });
    },
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createPlunge = (
    hitArea: KitHit["hitArea"],
    hitmarkFrames: number,
    animationFrames: number,
    index: number,
  ): KitAction => ({
    hits: [
      {
        element: Element.Cryo,
        gauge: 1,
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  // Framing's press and its hold share the press's Snappy Silhouette marks. The hold's Focused Impression is not built yet, as
  // Its hit falls a held duration later, which a skill's fixed hold levels cannot give (see the character's page)
  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Cryo,
        enemyStatus: () => {
          markedCount++;
          return markedCount <= SNAPPY_MARK_CAP ? createSnappyMark() : undefined;
        },
        gauge: 1,
        hitArea: SKILL_PRESS_HIT_AREA,
        hitmarkSeconds: SKILL_PRESS_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    onStart: () => {
      markedCount = 0;
    },
    seconds: SKILL_PRESS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Kamera's eight strikes, each the burst's circle at its tick's frame
  const kameraHits: KitHit[] = KAMERA_TICK_FRAMES.map((frames) => ({
    element: Element.Cryo,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: frames / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: burstMultiplier(5),
  }));

  const elementalBurst: KitAction = {
    hits: [
      {
        element: Element.Cryo,
        gauge: BURST_GAUGE,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: burstMultiplier(2),
      },
    ],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const { characterId } = combatant;
      const castCentre = createAheadBody(body, BURST_OFFSET_METRES).position;
      castKitSummon(kitEffectState, body, combatant, kameraHits);
      // The cast heal reaches the whole deployed team wherever it stands, whatever the burst strikes
      scheduleKitTask(kitEffectState, characterId, BURST_HITMARK_FRAMES / 60, (tick) =>
        healTeam(tick, combatant, burstMultiplier(1), burstMultiplier(0)),
      );
      // Each Kamera tick heals the character on the field while it stands in the circle the burst was cast at
      for (const frames of KAMERA_TICK_FRAMES)
        castKitField(kitEffectState, characterId, castCentre, {
          nextTickSeconds: frames / 60,
          onTick: (tick) =>
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              burstMultiplier(4) + burstMultiplier(3) * combatant.attributes.attack,
            ),
          radius: BURST_HEAL_RADIUS,
          secondsRemaining: frames / 60 + SUMMON_LINGER_SECONDS,
          tickIntervalSeconds: 1,
        });
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const lowPlunge = createPlunge(
    createCircleReach(0, LOW_PLUNGE_RADIUS),
    LOW_PLUNGE_HITMARK_FRAMES,
    LOW_PLUNGE_FRAMES,
    6,
  );
  const highPlunge = createPlunge(
    createCircleReach(0, HIGH_PLUNGE_RADIUS),
    HIGH_PLUNGE_HITMARK_FRAMES,
    HIGH_PLUNGE_FRAMES,
    7,
  );

  return {
    burstCooldownSeconds: burstMultiplier(7),
    burstEnergyCost: burstMultiplier(8),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(4),
    elementalBurst,
    elementalSkill,
    highPlunge,
    lowPlunge,
    normalAttacks: createNormalAttacks(),
    // Each Snappy Silhouette tick is a hit on the enemy it ticks on, priced by the press's multiplier at index 2
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.StatusTicked || event.status.id !== SNAPPY_MARK_STATUS_ID) return;
      const { enemy } = event;
      const tick = createKitSummon(
        { facing: 0, height: 0, position: { x: enemy.position.x, z: enemy.position.z } },
        combatant,
        [snappyMarkHit],
      );
      addKitEffect(kitEffectState, { ...tick, target: enemy });
    },
    plungeCollision: {
      element: Element.Cryo,
      gauge: 1,
      hitArea: createCircleReach(0, PLUNGE_COLLISION_RADIUS),
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: NO_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(5),
    },
    skillCooldownSeconds: skillMultiplier(7),
  };
};
