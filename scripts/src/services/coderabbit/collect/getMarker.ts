import type { MarkerKey } from "#src/models/coderabbit/collect/MarkerKey";

import { getBasisText } from "#src/services/coderabbit/collect/getBasisText";

const getKeyText = (key: MarkerKey): string => {
  if (typeof key === "number") return `review:${key}`;
  else if (typeof key === "string") return `commit:${key}`;
  else if ("patchId" in key) return `patch:${key.patchId}`;
  return `signature:${key.hash}`;
};
// A hidden marker on a pull request, commit or issue is the collector's memory for a fact no commit can carry — a
// Review whose body-only findings are answered, a drain that failed, a queue commit whose conflict could not be
// Resolved. An HTML comment renders as nothing. A number keys a review, a string keys a commit, a patch keys a commit
// Under whichever sha a rewrite gave it, and a failure signature keys a red `main` whichever head carries it. An
// Attempt's marker also names what the attempt was made against — the collector's own source, and for a cut the `main`
// Head — and a count reads only the markers naming the same basis: a fix to the collector, or a `main` that moved, is a
// Fresh turn for the work by itself, where a count that outlived the code that failed it left every fix waiting on a
// Person to reset it.
export const getMarker = (marker: string, key: MarkerKey, basisShas: string[] = []): string =>
  `<!-- ${marker} ${getKeyText(key)}${getBasisText(basisShas)} -->`;
