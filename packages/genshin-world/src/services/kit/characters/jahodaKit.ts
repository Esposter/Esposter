import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Element } from "#src/models/Element";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { takeOne } from "@esposter/shared";

// Savvy Strategy's flask fills to 100 over the pursuit, as gcsim (MIT, main) jahoda/skill.go gives it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/jahoda/skill.go
const FLASK_GAUGE_MAXIMUM = 100;
const PURSUIT_FIELD_ID = "jahoda-pursuit";
const DRAIN_FIELD_ID = "jahoda-drain";
const FLASK_GAUGE_STATUS_ID = "jahoda-flask-gauge";
const FLASK_ABSORBED_STATUS_PREFIX = "jahoda-flask-absorbed-";
// The drain timer outlives its one tick, so it ticks as the pursuit runs out
const PURSUIT_TICK_EXTRA_SECONDS = 0.1;

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

// Jahoda's behaviour: Savvy Strategy's press starts the pursuit, which follows the body and on each tick fills the flask
// From the enemies its circle holds an aura of, draining it once the gauge is full or the pursuit runs out, and its
// Second press drains it at once. Each drain lands the flask's filled or unfilled hit as a summon where it drains. Her
// Moonsign's robots and Meowball, Constellations 1, 2, 4 and 6, and Ascension 1 and 4 are not built yet
// Constellation 1 needs the Fluffy Meowball fired by the Purr-loined Treasure Flask, which is not built
// Constellation 2 needs Moonsign: Ascendant Gleam's element tracking in Plan to Get Paid, not built
// Constellation 4 needs the Purrsonal Coordinated Assistance Robot's gadget, which is not built
// Constellation 6 needs Moonsign: Ascendant Gleam and the flask's recovery, which are not built
export const createJahodaKitBehaviour = ({
  readArea,
  readHitFields,
  readParameter,
  readParameters,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const circle = readArea("pursuitCircle");
  const drainHitFields = readHitFields("flaskDrain", ["hitmarkSeconds", "talentMultiplier"]);
  const drainTalentMultipliers = readParameters("flaskDrainTalentMultipliers");
  const flaskFillValue = readParameter("flaskFillValue");
  // A flask that has absorbed an element fills by its full value from that element and by half from another
  const flaskWeakFillValue = flaskFillValue / 2;
  const pursuitSeconds = readSeconds("pursuit");
  const pursuitFirstFillSeconds = readSeconds("pursuitFirstFill");
  const fillIntervalSeconds = readSeconds("fillInterval");
  // The filled flask's hit lands sooner from a press, or the pursuit running out, than from the fill that fills it, and the
  // Unfilled flask's hit the same from each
  const filledDrainHit: KitHit = {
    ...drainHitFields,
    hitmarkSeconds: readSeconds("filledDrainHit"),
    talentMultiplier: takeOne(drainTalentMultipliers),
  };
  const filledPressHit: KitHit = {
    ...drainHitFields,
    hitmarkSeconds: readSeconds("filledPressHit"),
    talentMultiplier: takeOne(drainTalentMultipliers),
  };
  const unfilledHit: KitHit = {
    ...drainHitFields,
    hitmarkSeconds: readSeconds("unfilledHit"),
    talentMultiplier: takeOne(drainTalentMultipliers, 1),
  };

  // Drains the flask as gcsim's drainFlask does: its unfilled hit, or the filled hit given, then the pursuit and its drain
  // Timer end, the gauge and the absorbed element with them. The hit is a summon cast where the drain is
  const drainFlask = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant, filledHit: KitHit): void => {
    const hit = readFlaskGauge(kitEffectState, combatant.characterId) >= FLASK_GAUGE_MAXIMUM ? filledHit : unfilledHit;
    removeKitEffects(
      kitEffectState,
      (effect) =>
        (effect.kind === "field" && (effect.id === PURSUIT_FIELD_ID || effect.id === DRAIN_FIELD_ID)) ||
        (effect.kind === "status" &&
          (effect.id === FLASK_GAUGE_STATUS_ID || effect.id.startsWith(FLASK_ABSORBED_STATUS_PREFIX))),
    );
    castKitSummon(kitEffectState, body, combatant, [hit]);
  };

  const startPursuit = ({
    activeCombatant: combatant,
    body: { facing, height, position },
    kitEffectState,
  }: KitContext): void => {
    const { characterId } = combatant;
    const pursuit = castKitField(kitEffectState, characterId, position, {
      id: PURSUIT_FIELD_ID,
      isFollowing: true,
      nextTickSeconds: pursuitFirstFillSeconds,
      onTick: ({ enemyMap, kitEffectState: tickState }) => {
        const absorbed = findAbsorbedElement(
          [...enemyMap.values()].filter((enemy) => checkIsInAttackArea(circle, absorbedArea(pursuit.centre), enemy)),
        );
        if (absorbed === undefined) return;
        const flaskElement = readFlaskElement(tickState, characterId);
        if (flaskElement === undefined)
          addKitStatus(tickState, characterId, {
            id: `${FLASK_ABSORBED_STATUS_PREFIX}${absorbed}`,
            secondsRemaining: pursuitSeconds,
          });
        const amount = flaskElement === undefined || flaskElement === absorbed ? flaskFillValue : flaskWeakFillValue;
        const gauge = Math.min(readFlaskGauge(tickState, characterId) + amount, FLASK_GAUGE_MAXIMUM);
        addKitStatus(tickState, characterId, {
          id: FLASK_GAUGE_STATUS_ID,
          secondsRemaining: pursuitSeconds,
          stacks: gauge,
        });
        if (gauge >= FLASK_GAUGE_MAXIMUM)
          drainFlask(tickState, absorbedArea(pursuit.centre), combatant, filledDrainHit);
      },
      radius: circle.radius,
      secondsRemaining: pursuitSeconds,
      tickIntervalSeconds: fillIntervalSeconds,
    });
    addKitStatus(kitEffectState, characterId, {
      id: FLASK_GAUGE_STATUS_ID,
      secondsRemaining: pursuitSeconds,
      stacks: 0,
    });
    // The drain timer ticks once, when the pursuit's frames run out, on no circle, so it drains wherever the body stands
    castKitField(kitEffectState, characterId, position, {
      id: DRAIN_FIELD_ID,
      nextTickSeconds: pursuitSeconds,
      onTick: ({ kitEffectState: tickState }) =>
        drainFlask(tickState, { facing, height, position }, combatant, filledPressHit),
      secondsRemaining: pursuitSeconds + PURSUIT_TICK_EXTRA_SECONDS,
      tickIntervalSeconds: pursuitSeconds,
    });
  };

  return {
    skill: { onStart: startPursuit },
    // The second press drains the flask at once, its hit a summon cast where the body stands, since the hit depends on the
    // Gauge
    skillChain: [
      {
        onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
          drainFlask(kitEffectState, body, combatant, filledPressHit),
      },
    ],
  };
};
