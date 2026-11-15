import type { ScriptedStepKind } from "#src/models/dev/ScriptedStepKind";

// One step of a scripted session: a registry line run as it is written, or one of the four steps the harness takes
// Itself. An expect step's `field` names one key of the record its line answers, and is left out to compare the
// Whole value
export type ScriptedStep =
  | string
  | { equals: string; field?: string; kind: typeof ScriptedStepKind.Expect; line: string }
  | { kind: typeof ScriptedStepKind.Load }
  | { kind: typeof ScriptedStepKind.Save }
  | { kind: typeof ScriptedStepKind.Wait; seconds: number };
