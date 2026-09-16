import { readDuplicateProseFindings } from "#src/services/sweeps/duplicateProse/readDuplicateProseFindings";

// Prints rather than exits non-zero: the pass reads the list and decides which page owns each run and which
// Keeps a pointer (`.agents/ledgers/docs/README.md`); `src/workspace/duplicateProse.test.ts` is what fails on it.
for (const { paths, words } of readDuplicateProseFindings())
  console.info(`${paths[0]} | ${paths[1]}: ${words.length} words — ${words.slice(0, 12).join(" ")} …`);
