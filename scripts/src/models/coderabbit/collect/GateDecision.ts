import type { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";

export interface GateDecision {
  kind: GateDecisionKind;
  reason: string;
}
