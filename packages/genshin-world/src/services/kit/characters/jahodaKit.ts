import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import {
  PLUNGE_HIT_AREAS,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Jahoda's proud skill groups, read at her talent level. The attack group holds the strikes at 0 (the first), 1 (the second,
// Which both its hits read) and 2 (the third), the fully charged shot at 4, and the plunges' collision, low and high at 5, 6
// And 7. The skill group holds the unfilled flask's hit at 1, the filled flask's at 2, the flask's fill at 3 and the skill's
// Cooldown at 5. The burst group holds Hidden Aces' hit at 0, its cooldown at 7 and its energy cost at 8
const JAHODA_ATTACK_GROUP_ID = 12431;
const JAHODA_SKILL_GROUP_ID = 12432;
const JAHODA_BURST_GROUP_ID = 12439;

// Measured: gcsim (MIT, main) jahoda/attack.go, each strike's hitmarks, its arrow travelling 10 frames to its target, and
// The frame its action cancels at to walk. Each arrow lands on the primary target through a box, priced as a circle of a
// Metre round the body, as Ganyu's are
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/jahoda/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACKS = [
  { cancelFrames: 35, hitmarkFrames: [14], multiplierIndex: 0 },
  { cancelFrames: 52, hitmarkFrames: [15, 29], multiplierIndex: 1 },
  { cancelFrames: 99, hitmarkFrames: [40], multiplierIndex: 2 },
];

// Measured: gcsim (MIT, main) jahoda/aimed.go, the fully charged shot's animation at 85 frames and its arrow 10 frames
// After its hitmark
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/jahoda/aimed.go
const FULL_CHARGE_FRAMES = 85;

// Measured: gcsim (MIT, main) jahoda/burst.go, Hidden Aces' animation at 55 frames and its hit at 43 on a circle of radius 5
// Round the body, with the cooldown and energy the table gives
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/jahoda/burst.go
const BURST_FRAMES = 55;
const BURST_HITMARK_FRAMES = 43;
const CIRCLE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 5, radius: 5 });

// Measured: gcsim (MIT, main) jahoda/skill.go, Savvy Strategy's press at 12 frames past its 30-frame windup, and its pursuit of
// 334 frames, during which the flask fills every 30 frames from 7 frames in, on the enemies the circle of radius 5 round the
// Body holds an aura of. The pursuit drains when the gauge is full, 4 frames after the fill, with its filled hit 2 frames
// After that, or when its frames run out, with its unfilled hit 4 frames after. A press during the pursuit drains it at once
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/jahoda/skill.go
const SKILL_PRESS_FRAMES = 42;
const SKILL_DRAIN_PRESS_FRAMES = 48;
const SKILL_WINDUP_FRAMES = 30;
const PURSUIT_FRAMES = 334;
const FIRST_FILL_FRAMES = 7;
const FILL_INTERVAL_FRAMES = 30;
const FLASK_GAUGE_MAXIMUM = 100;
const FILLED_DRAIN_HIT_FRAMES = 6;
const FILLED_PRESS_HIT_FRAMES = 2;
const UNFILLED_HIT_FRAMES = 4;
const PURSUIT_FIELD_ID = "jahoda-pursuit";
const DRAIN_FIELD_ID = "jahoda-drain";
const FLASK_GAUGE_STATUS_ID = "jahoda-flask-gauge";
const FLASK_ABSORBED_STATUS_PREFIX = "jahoda-flask-absorbed-";
const PURSUIT_TICK_EXTRA_SECONDS = 0.1;

// Provisional: gcsim gives no poise for Jahoda's hits, so none is dealt until a source gives it
const NO_POISE_DAMAGE = 0;

export const JAHODA_CHARACTER_ID = 10_000_124;

const readFlaskGauge = (kitEffectState: KitEffectState, characterId: number): number =>
  kitEffectState.effects.reduce(
    (gauge, effect) =>
      effect.kind === "status" && effect.characterId === characterId && effect.id === FLASK_GAUGE_STATUS_ID
        ? (effect.stacks ?? 0)
        : gauge,
    0,
  );
const readFlaskElement = (kitEffectState: KitEffectState, characterId: number): Element | undefined =>
  Object.values(Element).find((element) =>
    kitEffectState.effects.some(
      (effect) =>
        effect.kind === "status" &&
        effect.characterId === characterId &&
        effect.id === `${FLASK_ABSORBED_STATUS_PREFIX}${element}`,
    ),
  );

// The body a flask's absorb check or drain acts from, standing on a field's centre
const absorbedArea = (centre: KitBody["position"]): KitBody => ({ facing: 0, height: 0, position: centre });

// Jahoda's first kit, at talent level 1: three strikes, a fully charged shot, two plunges with a collision, Savvy Strategy's
// Pursuit with its flask and its drains, and Hidden Aces' first hit. Her Moonsign's robots and Meowball, Constellations 1, 2,
// 4 and 6, and Ascension 1 and 4 are not built yet
export const createJahodaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, JAHODA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, JAHODA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, JAHODA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const flaskFillValue = skillMultiplier(3);
  const flaskWeakFillValue = flaskFillValue / 2;

  const createPlungeHit = (hitArea: AttackArea, multiplierIndex: number): KitHit => ({
    hitArea,
    hitmarkSeconds: 0,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: attackMultiplier(multiplierIndex),
  });

  // Drains the flask as gcsim's drainFlask does: its unfilled hit at 4 frames, or its filled hit at the given frames, then the
  // Pursuit and its drain timer end, the gauge and the absorbed element with them. The hit is a summon cast where the drain is
  const drainFlask = (
    kitEffectState: KitEffectState,
    body: KitBody,
    combatant: Combatant,
    filledHitmarkFrames: number,
  ): void => {
    const isFilled = readFlaskGauge(kitEffectState, combatant.characterId) >= FLASK_GAUGE_MAXIMUM;
    const hit: KitHit = {
      element: Element.Anemo,
      gauge: 1,
      hitArea: CIRCLE_HIT_AREA,
      hitmarkSeconds: (isFilled ? filledHitmarkFrames : UNFILLED_HIT_FRAMES) / 60,
      poiseDamage: NO_POISE_DAMAGE,
      talentMultiplier: skillMultiplier(isFilled ? 2 : 1),
    };
    kitEffectState.effects = kitEffectState.effects.filter(
      (effect) =>
        !(effect.kind === "field" && (effect.id === PURSUIT_FIELD_ID || effect.id === DRAIN_FIELD_ID)) &&
        !(
          effect.kind === "status" &&
          (effect.id === FLASK_GAUGE_STATUS_ID || effect.id.startsWith(FLASK_ABSORBED_STATUS_PREFIX))
        ),
    );
    castKitSummon(kitEffectState, body, combatant, [hit]);
  };

  const startPursuit = ({
    activeCombatant: combatant,
    body: { facing, height, position },
    kitEffectState,
  }: KitContext): void => {
    const { characterId } = combatant;
    const pursuitSeconds = (SKILL_WINDUP_FRAMES + PURSUIT_FRAMES) / 60;
    const pursuit: KitField = {
      centre: { x: position.x, z: position.z },
      characterId,
      id: PURSUIT_FIELD_ID,
      isFollowing: true,
      kind: "field",
      nextTickSeconds: (SKILL_WINDUP_FRAMES + FIRST_FILL_FRAMES) / 60,
      onTick: ({ enemyMap, kitEffectState: tickState }) => {
        const absorbed = findAbsorbedElement(
          [...enemyMap.values()].filter((enemy) =>
            checkIsInAttackArea(CIRCLE_HIT_AREA, absorbedArea(pursuit.centre), enemy),
          ),
        );
        if (absorbed === undefined) return;
        const flaskElement = readFlaskElement(tickState, characterId);
        if (flaskElement === undefined)
          addKitEffect(tickState, {
            characterId,
            id: `${FLASK_ABSORBED_STATUS_PREFIX}${absorbed}`,
            kind: "status",
            secondsRemaining: pursuitSeconds,
          });
        // A flask that has absorbed an element fills by its full value from that element and by half from another
        const amount = flaskElement === undefined || flaskElement === absorbed ? flaskFillValue : flaskWeakFillValue;
        const gauge = Math.min(readFlaskGauge(tickState, characterId) + amount, FLASK_GAUGE_MAXIMUM);
        addKitEffect(tickState, {
          characterId,
          id: FLASK_GAUGE_STATUS_ID,
          kind: "status",
          secondsRemaining: pursuitSeconds,
          stacks: gauge,
        });
        if (gauge >= FLASK_GAUGE_MAXIMUM)
          drainFlask(tickState, absorbedArea(pursuit.centre), combatant, FILLED_DRAIN_HIT_FRAMES);
      },
      radius: 5,
      secondsRemaining: pursuitSeconds,
      tickIndex: 0,
      tickIntervalSeconds: FILL_INTERVAL_FRAMES / 60,
    };
    addKitEffect(kitEffectState, pursuit);
    addKitEffect(kitEffectState, {
      characterId,
      id: FLASK_GAUGE_STATUS_ID,
      kind: "status",
      secondsRemaining: pursuitSeconds,
      stacks: 0,
    });
    // The drain timer ticks once, when the pursuit's frames run out, on no circle, so it drains wherever the body stands
    const drainTimer: KitField = {
      centre: { x: position.x, z: position.z },
      characterId,
      id: DRAIN_FIELD_ID,
      kind: "field",
      nextTickSeconds: pursuitSeconds,
      onTick: ({ kitEffectState: tickState }) =>
        drainFlask(tickState, { facing, height, position }, combatant, FILLED_PRESS_HIT_FRAMES),
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: pursuitSeconds + PURSUIT_TICK_EXTRA_SECONDS,
      tickIndex: 0,
      tickIntervalSeconds: pursuitSeconds,
    };
    addKitEffect(kitEffectState, drainTimer);
  };

  return {
    burstCooldownSeconds: burstMultiplier(7),
    burstEnergyCost: burstMultiplier(8),
    chargedAttack: {
      hits: [
        {
          element: Element.Anemo,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: (FULL_CHARGE_FRAMES + ARROW_TRAVEL_FRAMES) / 60,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(4),
        },
      ],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [
        {
          element: Element.Anemo,
          gauge: 1,
          hitArea: CIRCLE_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: burstMultiplier(0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      onStart: startPursuit,
      seconds: SKILL_PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The second press drains the flask at once, its hit a summon cast where the body stands, since the hit depends on the gauge
    elementalSkillChain: {
      followUps: [
        {
          hits: [],
          onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
            drainFlask(kitEffectState, body, combatant, FILLED_PRESS_HIT_FRAMES),
          seconds: SKILL_DRAIN_PRESS_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
      ],
      windowSeconds: (SKILL_WINDUP_FRAMES + PURSUIT_FRAMES) / 60,
    },
    highPlunge: { hits: [createPlungeHit(PLUNGE_HIT_AREAS.high, 7)], seconds: 0, targetingArea: STRIKE_TARGETING_AREA },
    lowPlunge: { hits: [createPlungeHit(PLUNGE_HIT_AREAS.low, 6)], seconds: 0, targetingArea: STRIKE_TARGETING_AREA },
    normalAttacks: NORMAL_ATTACKS.map(({ cancelFrames, hitmarkFrames, multiplierIndex }): KitAction => ({
      hits: hitmarkFrames.map((hitmarkFrame) => ({
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: (hitmarkFrame + ARROW_TRAVEL_FRAMES) / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(multiplierIndex),
      })),
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    })),
    plungeCollision: createPlungeHit(PLUNGE_HIT_AREAS.collision, 5),
    skillCooldownSeconds: skillMultiplier(5),
  };
};
