import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";

export interface UnappliedClaimsInput extends Pick<
  ExpressLaneInput,
  "collectorSha" | "cwd" | "isDryRun" | "mainSha" | "viewerLogin"
> {
  // The claimed commits the cut onto `mainSha` did not apply, in queue order
  shas: string[];
}
