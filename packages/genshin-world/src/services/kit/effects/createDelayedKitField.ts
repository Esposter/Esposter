import type { KitField } from "#src/models/kit/KitField";
import type { GroundPoint } from "genshin-engine";

import { SUMMON_LINGER_SECONDS, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";

// A field that ticks once, after its delay, as gcsim queues a task a kit's later change to the team waits on. It lingers
// SUMMON_LINGER_SECONDS past its tick, so the step that runs the tick still has it on the field. Its tick runs wherever
// The body stands, unless it is given a radius, when it runs only while the body stands within that radius of its centre
export const createDelayedKitField = (
  characterId: number,
  { x, z }: GroundPoint,
  delaySeconds: number,
  onTick: KitField["onTick"],
  radius = UNBOUNDED_FIELD_RADIUS,
): KitField => ({
  centre: { x, z },
  characterId,
  kind: "field",
  nextTickSeconds: delaySeconds,
  onTick,
  radius,
  secondsRemaining: delaySeconds + SUMMON_LINGER_SECONDS,
  tickIndex: 0,
  tickIntervalSeconds: 1,
});
