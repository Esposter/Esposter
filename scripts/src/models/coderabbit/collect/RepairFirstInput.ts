import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";

export interface RepairFirstInput extends Pick<RepairInput, "mainSha" | "viewerLogin"> {
  // The red whose repair the run's budget could not hold, which the mark is bounded per
  signature: FailureSignature;
}
