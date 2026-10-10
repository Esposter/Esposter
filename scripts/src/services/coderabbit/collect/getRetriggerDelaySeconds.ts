import { RETRIGGER_SLEEP_CAP_MS } from "#src/services/coderabbit/collect/constants";

// The sleep that wakes the cycle `waitMs` from now, in the seconds the retrigger job reads. A wait past one job's
// Longest sleep is slept in relays, the dispatched run reading what is left
export const getRetriggerDelaySeconds = (waitMs: number): number =>
  Math.ceil(
    Temporal.Duration.from({ milliseconds: Math.min(Math.max(waitMs, 0), RETRIGGER_SLEEP_CAP_MS) }).total("seconds"),
  );
