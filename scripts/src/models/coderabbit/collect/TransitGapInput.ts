import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";

export interface TransitGapInput extends Pick<RepairInput, "isDryRun" | "mainSha" | "viewerLogin"> {
  // The red run on `main`'s head, or the reviewed head's standing in for it (`readRedMainCheck`)
  check: MainCheck;
  failedJobNames: string[];
}
