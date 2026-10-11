import type { MachinePulse } from "../../models/MachinePulse";

import { checkIsIdle } from "./checkIsIdle";

// One more idle reading in a row, or none once a reading is at or over the line
export const getIdleMinutes = (reading: MachinePulse, idleMinutes: number): number =>
  checkIsIdle(reading) ? idleMinutes + 1 : 0;
