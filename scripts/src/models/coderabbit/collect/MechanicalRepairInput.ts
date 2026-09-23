import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

// What the regenerating repair is pointed at: the checkout, the red head it answers, and the run whose verdict
// Named it — which goes in the commit body, because that body is the only review the repair gets
export interface MechanicalRepairInput extends Pick<CycleInput, "collectorSha"> {
  cwd: string;
  mainSha: string;
  runUrl: string;
}
