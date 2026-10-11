import type { MachinePulse } from "../../models/MachinePulse";

import { UTILIZATION_LINE_PERCENTAGE } from "../constants";

// Idle is under the line on the CPU, and under it on the GPU or with the GPU unread
export const checkIsIdle = (reading: Pick<MachinePulse, "cpuPercentage" | "gpuPercentage">): boolean =>
  reading.cpuPercentage < UTILIZATION_LINE_PERCENTAGE &&
  (reading.gpuPercentage === undefined || reading.gpuPercentage < UTILIZATION_LINE_PERCENTAGE);
