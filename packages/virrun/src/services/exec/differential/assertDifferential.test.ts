import type { NormalizationRule } from "#src/models/exec/differential/NormalizationRule";
import type { ExecBackend } from "#src/models/exec/ExecBackend";

import { normalizeExecResult } from "#src/services/exec/differential/normalizeExecResult";
import { describe, expect } from "vitest";

// The shared body of every differential correctness test: run the same command through the candidate backend
// And the native baseline, normalize both with the case's rules, then assert they are observably identical
// (exit code + stdout + stderr). Backends own which corpus they feed it; the assert itself is backend-blind.
// See packages/app/content/docs/virrun/correctness.md.
export const assertDifferential = async (
  backend: ExecBackend,
  baseline: ExecBackend,
  command: readonly string[] | string,
  rules: readonly NormalizationRule[] = [],
): Promise<void> => {
  const baselineResult = await baseline.exec(command, { cwd: "", stdio: "pipe" });
  const backendResult = await backend.exec(command, { cwd: "", stdio: "pipe" });

  expect(normalizeExecResult(backendResult, rules)).toStrictEqual(normalizeExecResult(baselineResult, rules));
};

describe.todo("assertDifferential");
