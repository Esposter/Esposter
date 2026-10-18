import type { KitContext } from "#src/models/kit/KitContext";
import type { GroundPoint } from "genshin-engine";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { checkIsAmountReached } from "#src/services/checkIsAmountReached";
import { checkIsElectroCharged } from "#src/services/combat/aura/checkIsElectroCharged";
import { LUNAR_CHARGED_INTERNAL_COOLDOWN_SECONDS } from "#src/services/combat/aura/constants";
import { ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";
import { strikeLunarCharged } from "#src/services/kit/strikeLunarCharged";
import { LUNAR_CHARGED_CLOUD_RADIUS, LUNAR_CHARGED_CLOUD_TICK_SECONDS } from "#src/services/party/constants";
import { runDownSeconds } from "#src/services/runDownSeconds";

// The party's Lunar-Charged cloud some seconds on, written in place: each tick that falls due while it stands strikes
// Every standing enemy within its radius of the character on the field, measured to the enemy's edge, whose Electro and
// Hydro lie together as Lunar-Charged, once every 2 seconds on each, and the cloud's seconds run down
export const strikeLunarChargedCloud = (stepSeconds: number, position: GroundPoint, context: KitContext): void => {
  const { lunarChargedCloud } = context.party;
  if (lunarChargedCloud.secondsRemaining <= 0) return;
  let { tickSeconds } = lunarChargedCloud;
  while (checkIsAmountReached(stepSeconds, tickSeconds) && tickSeconds < lunarChargedCloud.secondsRemaining) {
    for (const enemy of context.enemyMap.values()) {
      const { elementalState } = enemy;
      if (
        [EnemyState.Dead, EnemyState.Return].includes(enemy.state) ||
        !elementalState.isLunarCharged ||
        !checkIsElectroCharged(elementalState.auras) ||
        elementalState.seconds - elementalState.lunarChargedSeconds < LUNAR_CHARGED_INTERNAL_COOLDOWN_SECONDS ||
        Math.hypot(enemy.position.x - position.x, enemy.position.z - position.z) >
          LUNAR_CHARGED_CLOUD_RADIUS + ENEMY_CAPSULE_RADIUS
      )
        continue;
      elementalState.lunarChargedSeconds = elementalState.seconds;
      strikeLunarCharged(enemy, context);
    }
    tickSeconds += LUNAR_CHARGED_CLOUD_TICK_SECONDS;
  }
  lunarChargedCloud.tickSeconds = tickSeconds - stepSeconds;
  lunarChargedCloud.secondsRemaining = Math.max(0, runDownSeconds(lunarChargedCloud.secondsRemaining, stepSeconds));
};
