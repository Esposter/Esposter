import { readCitingPages } from "#src/services/citations/readCitingPages";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";

// Prints rather than exits non-zero: a run two pages share is a candidate, not a defect — the pass decides which
// Page owns it and which keeps a pointer (`.agents/ledgers/docs/README.md`). A README and a ledger are shaped by
// A template each of their kind repeats, so the docs and the skills are the pages read.
for (const { paths, words } of getDuplicateProse(
  readCitingPages().filter(({ path }) => !path.endsWith("README.md") && !path.startsWith(".agents/ledgers/")),
))
  console.info(`${paths[0]} | ${paths[1]}: ${words.length} words — ${words.slice(0, 12).join(" ")} …`);
