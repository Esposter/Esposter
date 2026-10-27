import { MachineState } from "#src/models/machine/MachineState";
import { z } from "zod";

// The watcher's latest reading, as `{state-root}/machine/state.json` holds it each minute: when it was taken, the watcher's
// Process to check is alive, and the figures the reading classified the machine by. The GPU figure is absent where the
// Machine has no reader for it
export interface MachineStateFile {
  at: string;
  cpuPercentage: number;
  freeGigabytes: number;
  gpuPercentage?: number;
  minutesInState: number;
  processId: number;
  state: MachineState;
}

export const machineStateFileSchema: z.ZodType<MachineStateFile> = z.object({
  at: z.string(),
  cpuPercentage: z.number(),
  freeGigabytes: z.number(),
  gpuPercentage: z.number().optional(),
  minutesInState: z.number(),
  processId: z.number(),
  state: z.enum(MachineState),
});
