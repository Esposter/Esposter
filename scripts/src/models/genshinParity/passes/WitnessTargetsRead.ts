import type { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";

export type WitnessTargetsRead = Awaited<ReturnType<typeof readWitnessTargets>>;
