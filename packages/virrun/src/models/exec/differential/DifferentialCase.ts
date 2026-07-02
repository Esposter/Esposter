import type { NormalizationRule } from "@/models/exec/differential/NormalizationRule";

// One entry in a differential correctness corpus: a command run identically through a candidate backend and
// The native baseline, whose normalized results must match. The corpus is the source of truth for the
// Correctness gate and grows whenever a real repo exposes a gap. See features/virrun/specs/correctness.md.
export interface DifferentialCase {
  // The command, run identically on both sides (string → host shell, argv → shell: false; see ExecBackend).
  command: readonly string[] | string;
  // Short label for the test name (the command itself may be argv or unreadable).
  name: string;
  // Normalization applied to both results before diffing. Omitted means the command is fully deterministic
  // And its output is compared verbatim.
  rules?: readonly NormalizationRule[];
}
