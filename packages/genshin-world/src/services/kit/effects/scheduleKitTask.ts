import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";

// A task a character's kit runs once, its delay on, as gcsim queues one on its character (QueueCharTask): a field over
// The whole world that ticks once at its delay and lingers SUMMON_LINGER_SECONDS past it, so the step that runs it still
// Has it on the field. Its id, if it is given one, is how its kit finds it to cancel it
export const scheduleKitTask = (
  kitEffectState: KitEffectState,
  characterId: number,
  delaySeconds: number,
  onTick: KitField["onTick"],
  fields: Partial<Pick<KitField, "id">> = {},
): void =>
  castKitField(
    kitEffectState,
    characterId,
    { x: 0, z: 0 },
    {
      nextTickSeconds: delaySeconds,
      onTick,
      secondsRemaining: delaySeconds + SUMMON_LINGER_SECONDS,
      tickIntervalSeconds: Number.POSITIVE_INFINITY,
      ...fields,
    },
  );
