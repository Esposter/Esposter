import type { PulseWakeOptions } from "../../models/PulseWakeOptions";
import type { PulseWakeState } from "../../models/PulseWakeState";

import { IDLE_WAKE_MINUTES, IDLE_WAKE_REPEAT_MILLISECONDS } from "../constants";
import { checkIsIdle } from "./checkIsIdle";

// Whether the session is woken now: the machine has been idle long enough, nothing is holding the session back, and
// Either this idle episode has not woken it yet or the last wake was a repeat interval ago
export const getPulseWake = (
  state: PulseWakeState,
  { isTurnRunning, isWindDown, lastWakeMs, nowMs }: PulseWakeOptions,
): boolean =>
  checkIsIdle(state) &&
  state.idleMinutes >= IDLE_WAKE_MINUTES &&
  !isTurnRunning &&
  !isWindDown &&
  (lastWakeMs === 0 || nowMs - lastWakeMs >= IDLE_WAKE_REPEAT_MILLISECONDS);
