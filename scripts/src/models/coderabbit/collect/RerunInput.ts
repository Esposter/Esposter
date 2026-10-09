import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { TransitGapInput } from "#src/models/coderabbit/collect/TransitGapInput";

export interface RerunInput extends Pick<TransitGapInput, "check" | "isDryRun" | "mainSha" | "viewerLogin"> {
  // The queue's run that passed over `main`'s own tree a job `main` failed
  queueCheck: MainCheck;
}
