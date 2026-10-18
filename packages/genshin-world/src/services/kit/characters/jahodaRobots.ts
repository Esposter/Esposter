import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { Element } from "#src/models/Element";
import type { GroundPoint } from "genshin-engine";

import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { schedulePeriodicKitTask } from "#src/services/kit/effects/schedulePeriodicKitTask";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";

// The robots' timings and the strike they deal, as the record gives them. A robot checks its circle for an aura from its
// First check, then every interval while it finds none, and the next robot checks a spacing after the one before. Once a
// Robot absorbs an element it strikes the nearest enemies from the first strike after the absorb, then every strike
// Interval, until the burst's seconds end
type JahodaRobotSettings = {
  absorbArea: AttackArea;
  absorbFirstSeconds: number;
  absorbIntervalSeconds: number;
  absorbSpacingSeconds: number;
  robotCount: number;
  strikeFirstSeconds: number;
  strikeHit: KitHit;
  strikeIntervalSeconds: number;
  strikeTargetCount: number;
};

const absorbedBody = (position: GroundPoint): KitBody => ({ facing: 0, height: 0, position });

const squaredDistance = (point: GroundPoint, other: GroundPoint): number =>
  (point.x - other.x) ** 2 + (point.z - other.z) ** 2;

// The nearest live enemies to the body, up to the count, each struck once with the element the robot absorbed
const strikeNearest = (
  context: KitContext,
  combatant: Combatant,
  element: Element,
  { strikeHit, strikeTargetCount }: JahodaRobotSettings,
): void => {
  const { body, enemyMap } = context;
  const nearest = [...enemyMap.values()]
    .filter(({ health }) => health > 0)
    .sort((a, b) => squaredDistance(a.position, body.position) - squaredDistance(b.position, body.position))
    .slice(0, strikeTargetCount);
  for (const enemy of nearest) queueKitPassiveHit(context, combatant, { ...strikeHit, element }, enemy);
};

// Starts each robot's checks for an aura at the burst's cast, which the burst's seconds end. A robot checks until it
// Absorbs one, the one its circle holds with the highest priority, and never checks again after
export const startJahodaRobots = (
  context: KitContext,
  combatant: Combatant,
  burstSeconds: number,
  settings: JahodaRobotSettings,
): void => {
  const { characterId } = combatant;
  for (let robotIndex = 0; robotIndex < settings.robotCount; robotIndex++) {
    const absorbFirstSeconds = settings.absorbFirstSeconds + robotIndex * settings.absorbSpacingSeconds;
    let isAbsorbed = false;
    schedulePeriodicKitTask(
      context.kitEffectState,
      characterId,
      { firstSeconds: absorbFirstSeconds, intervalSeconds: settings.absorbIntervalSeconds, untilSeconds: burstSeconds },
      (checkContext, tickIndex) => {
        if (isAbsorbed) return;
        const { body, enemyMap } = checkContext;
        const reachedEnemies = [...enemyMap.values()].filter((enemy) =>
          checkIsInAttackArea(settings.absorbArea, absorbedBody(body.position), enemy),
        );
        const element = findAbsorbedElement(reachedEnemies);
        if (element === undefined) return;
        isAbsorbed = true;
        // The absorb happens on this check, so the strikes run out with the burst, from the absorb's own seconds
        const absorbSeconds = absorbFirstSeconds + tickIndex * settings.absorbIntervalSeconds;
        schedulePeriodicKitTask(
          checkContext.kitEffectState,
          characterId,
          {
            firstSeconds: settings.strikeFirstSeconds,
            intervalSeconds: settings.strikeIntervalSeconds,
            untilSeconds: burstSeconds - absorbSeconds,
          },
          (strikeContext) => strikeNearest(strikeContext, combatant, element, settings),
        );
      },
    );
  }
};
