import type { DifferentialCase } from "@/models/exec/DifferentialCase";
import type { NormalizationRule } from "@/models/exec/NormalizationRule";

import { describe } from "vitest";

// Masks any run of ASCII digits. Used for commands whose only nondeterminism is a counter or epoch (e.g.
// `date +%s`), so the differential assert compares the surrounding structure, not the volatile number.
const DIGIT_SEQUENCE_REGEX = /\d+/gu;
export const DIGIT_SEQUENCE_RULE: NormalizationRule = { pattern: DIGIT_SEQUENCE_REGEX, placeholder: "<digits>" };

// `node` workloads every backend can run — native, the os sandbox, and the vfs in-process runner. The vfs
// Correctness gate is built on these because `node -e`/`node <file>` is the only class vfs executes itself.
export const NODE_DIFFERENTIAL_CORPUS: readonly DifferentialCase[] = [
  // Argv form (shell: false) so the gate also covers the no-shell path, not just shell strings.
  { command: ["node", "--version"], name: "version argv" },
  { command: `node -e "process.stdout.write(' ')"`, name: "stdout write" },
  { command: `node -e "process.stderr.write(' ')"`, name: "stderr write" },
  { command: `node -e "process.exit(3)"`, name: "non-zero exit" },
  { command: `node -e "process.stdout.write(require('node:path').sep)"`, name: "module require" },
  { command: `node -e ""`, name: "empty program" },
  { command: `node -e "throw new Error(' ')"`, name: "uncaught throw" },
  { command: `node -p "1 + 1"`, name: "print expression" },
  { command: `node --version`, name: "version flag" },
];

// Arbitrary shell processes only a real-exec backend can run — native and the os sandbox. `date +%s` carries
// The digit-mask rule so the corpus exercises the normalization seam, not just verbatim comparisons.
export const SHELL_DIFFERENTIAL_CORPUS: readonly DifferentialCase[] = [
  { command: `echo hello`, name: "echo" },
  { command: `printf 'a\\nb'`, name: "printf multiline" },
  { command: `pwd`, name: "working directory" },
  { command: `cat /etc/hostname`, name: "read system file" },
  { command: `false`, name: "false exit" },
  { command: `sh -c 'exit 7'`, name: "explicit exit code" },
  { command: `date +%s`, name: "epoch timestamp", rules: [DIGIT_SEQUENCE_RULE] },
];

describe.todo("differentialCorpus");
