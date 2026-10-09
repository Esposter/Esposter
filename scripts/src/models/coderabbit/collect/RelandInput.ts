import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface RelandInput extends Pick<CycleInput, "collectorSha" | "cwd" | "isDryRun"> {
  viewerLogin: string;
}
