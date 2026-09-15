import { readConstantScopeFindings } from "#src/services/sweeps/constantScope/readConstantScopeFindings";

// Prints rather than exits non-zero: the pass reads the list, and `src/workspace/constantScope.test.ts` is what
// Fails on it. A clean repository prints nothing — every shape that cannot move into a describe is the scan's
// To know, not a list here (`.agents/ledgers/testing/README.md`).
for (const finding of readConstantScopeFindings()) console.info(finding);
