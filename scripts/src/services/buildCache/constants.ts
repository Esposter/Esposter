import { SITE_NAME } from "@esposter/shared";
import { join } from "node:path";

// The machine's run slots, one directory shared with the shell gate (`.agents/skills/throughput/scripts/run-in-slot.sh`),
// So a build and a typecheck count against the same slots and read the same admission record
export const SLOT_DIRECTORY: string = join(process.env.TEMP || "/tmp", `${SITE_NAME.toLowerCase()}-run-slots`);
// Half the performance cores, from one to four, unless RUN_SLOT_COUNT names a count
export const SLOT_MIN_COUNT = 1;
export const SLOT_MAX_COUNT = 4;
// A run is admitted only while free memory is above an eighth of the machine's RAM
export const SLOT_MEMORY_DIVISOR = 8;
// The last admitted run is ramped once a minute has passed since its admission, long enough for a build to reach its peak
export const SLOT_RAMP_SECONDS: number = Temporal.Duration.from({ minutes: 1 }).total({ unit: "seconds" });
// A lock or slot whose holder died, or with no holder a minute on, is freed, since nothing holds it that long
export const SLOT_STALE_SECONDS: number = Temporal.Duration.from({ minutes: 1 }).total({ unit: "seconds" });
// A waiting run polls after two seconds, doubling to every ten: a slot frees on the scale of minutes
export const SLOT_MIN_POLL_MILLISECONDS: number = Temporal.Duration.from({ seconds: 2 }).total({
  unit: "milliseconds",
});
export const SLOT_MAX_POLL_MILLISECONDS: number = Temporal.Duration.from({ seconds: 10 }).total({
  unit: "milliseconds",
});
// The variable a gate sets for the command it runs, to the gate's process id. A gate that finds it already set is
// Running inside a slot its parent holds, so it runs at once rather than wait on that slot
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const RUN_IN_SLOT_ENVIRONMENT_NAME: string = `${SITE_NAME.toUpperCase()}_RUN_IN_SLOT`;
