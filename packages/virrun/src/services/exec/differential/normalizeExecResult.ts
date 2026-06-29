import type { ExecResult } from "@/models/exec/ExecResult";
import type { NormalizationRule } from "@/models/exec/NormalizationRule";
// Masks unavoidable nondeterminism in a command's output by applying each rule, in order, to stdout and
// Stderr — so the same volatile fragment (an epoch, a temp path) collapses to the same token on both the
// Sandbox and the native result before they are diffed. The exit code is structural and never rewritten.
// Normalization is purely the supplied rules: nothing is stripped implicitly, so a genuine divergence is
// Never hidden by the harness. See features/virrun/specs/correctness.md.
export const normalizeExecResult = (result: ExecResult, rules: readonly NormalizationRule[]): ExecResult => {
  const applyRules = (text: string): string =>
    rules.reduce((accumulated, { pattern, placeholder }) => accumulated.replaceAll(pattern, placeholder), text);
  return { exitCode: result.exitCode, stderr: applyRules(result.stderr), stdout: applyRules(result.stdout) };
};
