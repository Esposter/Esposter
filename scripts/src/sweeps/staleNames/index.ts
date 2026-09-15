import { readCitingPages } from "#src/services/citations/readCitingPages";
import { getStaleNames } from "#src/services/sweeps/staleNames/getStaleNames";
import { readSourceNames } from "#src/services/sweeps/staleNames/readSourceNames";

// Prints rather than exits non-zero: a name the source no longer holds is a candidate, not a defect — a page
// Naming a dependency's API, or a banned one, cites a name that was never in the tree (`.agents/ledgers/docs/README.md`)
for (const { name, path } of getStaleNames(readCitingPages(), readSourceNames())) console.info(`${path}: ${name}`);
