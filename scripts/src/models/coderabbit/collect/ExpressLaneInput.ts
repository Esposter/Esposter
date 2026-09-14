import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";

export interface ExpressLaneInput extends ExpressInput {
  isDryRun: boolean;
}
