import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";
import type { ScriptedStep } from "#src/models/dev/ScriptedStep";
import type { ScriptedStepKind } from "#src/models/dev/ScriptedStepKind";

import { readScriptedField } from "#src/services/dev/readScriptedField";

// Runs the line an expect step names and compares what it answers with the step's text, exactly. A field compares
// One key of the record the line answers, so the `state` line's place compares as its own value
export const runScriptedExpect = (
  driver: ScriptedSessionDriver,
  step: Extract<ScriptedStep, { kind: ScriptedStepKind.Expect }>,
): ScriptedSessionOutcome => {
  const result = driver.run(step.line);
  if (!result.ok) return { error: `expect ${step.line} refused: ${result.error}`, ok: false };

  const subject = step.field === undefined ? step.line : `${step.line} ${step.field}`;
  const read = step.field === undefined ? String(result.value) : readScriptedField(String(result.value), step.field);
  if (read === undefined) return { error: `expect ${subject}: no such field`, ok: false };
  if (read === step.equals) return { ok: true };

  return { error: `expect ${subject}: read "${read}", expected "${step.equals}"`, ok: false };
};
