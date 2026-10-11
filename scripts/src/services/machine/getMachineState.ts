import { MachineState } from "#src/models/machine/MachineState";
import {
  CPU_TARGET_PERCENTAGE,
  GATE_MEMORY_SHARE,
  GIBIBYTE,
  ROOM_MEMORY_SHARE,
  WINDOW_MINUTES,
} from "#src/services/machine/constants";
import { totalmem } from "node:os";

// Tight holds new runs under the gate, idle needs a full window under the CPU target with room to spare, and busy is the rest.
// The gate and the room are shares of the machine's total RAM, which defaults to this machine's own
export const getMachineState = (
  cpuAveragePercentage: number,
  sampleCount: number,
  freeGigabytes: number | undefined,
  totalGigabytes: number = totalmem() / GIBIBYTE,
): MachineState => {
  // Neither tight nor idle can be claimed without a memory reading, and idle claims room, so the machine reads busy
  if (freeGigabytes === undefined) return MachineState.Busy;
  if (freeGigabytes < totalGigabytes * GATE_MEMORY_SHARE) return MachineState.Tight;
  if (
    sampleCount >= WINDOW_MINUTES &&
    cpuAveragePercentage < CPU_TARGET_PERCENTAGE &&
    freeGigabytes > totalGigabytes * ROOM_MEMORY_SHARE
  )
    return MachineState.Idle;
  return MachineState.Busy;
};
