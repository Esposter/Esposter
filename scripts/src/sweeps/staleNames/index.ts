import { readCitingPages } from "#src/services/citations/readCitingPages";
import { getStaleNames } from "#src/services/sweeps/staleNames/getStaleNames";
import { readDependencyNames } from "#src/services/sweeps/staleNames/readDependencyNames";
import { readSourceNames } from "#src/services/sweeps/staleNames/readSourceNames";

// Prints rather than exits non-zero: a name neither the tree nor a dependency holds is a candidate, not a defect —
// A page naming an external system's setting or error code cites a name nothing installed declares
// (`.agents/ledgers/docs/README.md`)
for (const { name, path } of getStaleNames(readCitingPages(), readSourceNames().union(readDependencyNames())))
  console.info(`${path}: ${name}`);
