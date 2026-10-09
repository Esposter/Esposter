import { MachineState } from "#src/models/machine/MachineState";
import { CPU_TARGET_PERCENTAGE, GATE_GIGABYTES, ROOM_GIGABYTES, WINDOW_MINUTES } from "#src/services/machine/constants";

// Tight holds new runs under the gate, idle needs a full window under the CPU target with room to spare, and busy is the rest
export const getMachineState = (
  cpuAveragePercentage: number,
  sampleCount: number,
  freeGigabytes: number,
): MachineState => {
  if (freeGigabytes < GATE_GIGABYTES) return MachineState.Tight;
  if (sampleCount >= WINDOW_MINUTES && cpuAveragePercentage < CPU_TARGET_PERCENTAGE && freeGigabytes > ROOM_GIGABYTES)
    return MachineState.Idle;
  return MachineState.Busy;
};
