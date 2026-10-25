import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";

export type WitnessTargetsRead = Awaited<ReturnType<typeof readWitnessTargets>>;
