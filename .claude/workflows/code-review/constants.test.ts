import { fileURLToPath } from "node:url";
import { describe } from "vitest";

import type { Candidate } from "./models/Candidate";
import type { ScopeAnswer } from "./models/ScopeAnswer";

/**
 * The shipped script, loaded from disk rather than imported: it is a workflow body using top-level `return` and
 * harness-injected globals, so `import` cannot load it, and it cannot be split into modules to make it loadable
 * (see the `.claude/workflows/*.js` entry in the file-organization skill). Testing a copy of its logic would
 * pass while the file it stands in for was broken.
 */
export const SCRIPT_PATH: string = fileURLToPath(new URL("../code-review.js", import.meta.url));
/** A Scope answer complete enough for any run; individual suites override one field. */
export const SCOPE_DEFAULT: ScopeAnswer = {
  changedLines: 900,
  claudeMdFiles: [],
  conventions: "",
  diffCommand: "git diff main...HEAD",
  files: ["a.ts", "b.ts"],
  recordIndex: "",
  summary: "a change",
};
/** A verdict that settles its candidate, so a suite varies only the field it is about. */
export const VERDICT_DEFAULT = { confidence: 90, evidence: "read the line", provenance: "new", severity: "major" };
/** The one candidate most suites need. */
export const CANDIDATE: Candidate = {
  failure_scenario: "it drops the row",
  file: "a.ts",
  line: 4,
  summary: "Reordered write drops the entity",
};
export const AREA_ARGS = "area high the cache";
/**
 * A minimal area scope: three files, one governing page, no claims. `CANDIDATE.file` is one of them on purpose —
 * a fixture whose candidate sits outside the audited area sends every area test down the "NOT part of the audited
 * area" branch, leaving the ordinary in-area verifier path (materialFor's resolved reading list) driven by
 * nothing. The out-of-area branch has its own test, which names its own file.
 */
export const AREA_SCOPE: ScopeAnswer = {
  claims: [],
  docPaths: ["docs/cache.md"],
  files: [CANDIDATE.file, "cache/a.ts", "cache/b.ts"],
};

describe.todo("constants");
