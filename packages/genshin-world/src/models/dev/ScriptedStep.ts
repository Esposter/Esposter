import type { ScriptedStepKind } from "#src/models/dev/ScriptedStepKind";

// One step of a scripted session: a registry line run as it is written, or one of the four steps the harness takes
// Itself. An expect step's `field` names one key of the record its line answers, and is left out to compare the
// Whole value
export type ScriptedStep =
  | { equals: string; field?: string; kind: ScriptedStepKind.Expect; line: string }
  | { kind: ScriptedStepKind.Load }
  | { kind: ScriptedStepKind.Save }
  | { kind: ScriptedStepKind.Wait; seconds: number }
  | string;
