import type { ExecResult } from "@/models/exec/ExecResult";
import type { NormalizationRule } from "@/models/exec/differential/NormalizationRule";
// Masks unavoidable nondeterminism before a sandbox/native diff by applying each rule to stdout and stderr (the exit
// Code is structural, never rewritten). Only the supplied rules apply — nothing is stripped implicitly, so a genuine
// Divergence is never hidden (specs/correctness.md).
export const normalizeExecResult = (result: ExecResult, rules: readonly NormalizationRule[]): ExecResult => {
  const applyRules = (text: string): string =>
    rules.reduce((accumulated, { pattern, placeholder }) => accumulated.replaceAll(pattern, placeholder), text);
  return { exitCode: result.exitCode, stderr: applyRules(result.stderr), stdout: applyRules(result.stdout) };
};
