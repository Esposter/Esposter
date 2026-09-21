import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";

export interface ExpressLaneInput extends ExpressInput {
  // The basis a red cut's attempts are counted against, with the `main` head (`getMarker`)
  collectorSha: string;
  isDryRun: boolean;
  viewerLogin: string;
}
