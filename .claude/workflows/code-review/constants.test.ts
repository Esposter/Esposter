import { fileURLToPath } from "node:url";
import { describe } from "vitest";

import type { Candidate } from "./models/Candidate";

/**
 * The shipped script, loaded from disk rather than imported: it is a workflow body using top-level `return` and
 * harness-injected globals, so `import` cannot load it, and it cannot be split into modules to make it loadable
 * (see the `.claude/workflows/*.js` entry in the file-organization skill). Testing a copy of its logic would
 * pass while the file it stands in for was broken.
 */
export const SCRIPT_PATH = fileURLToPath(new URL("../code-review.js", import.meta.url));
/** A Scope answer complete enough for any run; individual suites override one field. */
export const SCOPE_DEFAULT = {
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
/** A minimal area scope: two files, one governing page, no claims. */
export const AREA_SCOPE = { claims: [], docPaths: ["docs/cache.md"], files: ["cache/a.ts", "cache/b.ts"] };

describe.todo("constants");
