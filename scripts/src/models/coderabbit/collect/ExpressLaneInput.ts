import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";

export interface ExpressLaneInput extends ExpressInput, Pick<CycleInput, "collectorSha"> {
  isDryRun: boolean;
  viewerLogin: string;
}
