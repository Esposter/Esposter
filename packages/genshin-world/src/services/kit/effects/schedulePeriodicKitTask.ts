import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KIT_TICK_TOLERANCE_SECONDS, SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";

// A task a character's kit runs on a schedule while its seconds last, as gcsim queues one that repeats on its
// Character: a field over the whole world, so it runs wherever the body stands, whose first tick falls at firstSeconds
// And whose next ticks fall every intervalSeconds after, for those that fall before untilSeconds. It lingers
// SUMMON_LINGER_SECONDS past that, so the step that runs its last tick still has it on the field
export const schedulePeriodicKitTask = (
  kitEffectState: KitEffectState,
  characterId: number,
  {
    firstSeconds,
    intervalSeconds,
    untilSeconds,
  }: { firstSeconds: number; intervalSeconds: number; untilSeconds: number },
  onTick: (context: KitContext, tickIndex: number) => void,
): void => {
  // A tick that falls at untilSeconds exactly is passed over, so the count is the ticks strictly before it
  const tickCount =
    firstSeconds < untilSeconds
      ? Math.ceil((untilSeconds - firstSeconds) / intervalSeconds - KIT_TICK_TOLERANCE_SECONDS)
      : 0;
  castKitField(
    kitEffectState,
    characterId,
    { x: 0, z: 0 },
    {
      nextTickSeconds: firstSeconds,
      onTick: (context, tickIndex) => {
        if (tickIndex < tickCount) onTick(context, tickIndex);
      },
      secondsRemaining: untilSeconds + SUMMON_LINGER_SECONDS,
      tickIntervalSeconds: intervalSeconds,
    },
  );
};
