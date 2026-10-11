import type { CommitAttemptsInput } from "#src/models/coderabbit/collect/CommitAttemptsInput";
import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";

export interface ExpressLaneInput extends ExpressInput, Pick<CommitAttemptsInput, "collectorSha" | "viewerLogin"> {
  isDryRun: boolean;
}
