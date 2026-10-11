import type { PulseWakeOptions } from "../../models/PulseWakeOptions";

import { IDLE_LINE_PREFIX } from "../constants";

// Whether a line the watcher printed wakes the session: it is the line of the machine going idle, and no turn or usage
// Reserve holds the session back
export const getPulseWake = (line: string, { isTurnRunning, isWindDown }: PulseWakeOptions): boolean =>
  line.startsWith(IDLE_LINE_PREFIX) && !isTurnRunning && !isWindDown;
