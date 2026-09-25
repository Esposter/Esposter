import type { AttemptsInput } from "#src/models/coderabbit/collect/AttemptsInput";

export interface CommitAttemptsInput extends Pick<
  AttemptsInput,
  "collectorSha" | "marker" | "stackedAttempts" | "viewerLogin"
> {
  // The commit the attempts are recorded on
  sha: string;
}
