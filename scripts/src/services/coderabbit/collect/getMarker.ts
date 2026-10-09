import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";

import { getBasisText } from "#src/services/coderabbit/collect/getBasisText";

const getKeyText = (key: FailureSignature | number | string): string => {
  if (typeof key === "number") return `review:${key}`;
  else if (typeof key === "string") return `commit:${key}`;
  return `signature:${key.hash}`;
};
// A hidden marker on a pull request, commit or issue is the collector's memory for a fact no commit can carry — a
// Review whose body-only findings are answered, a drain that failed, a queue commit whose conflict could not be
// Resolved. An HTML comment renders as nothing. A number keys a review, a string keys a commit, and a failure signature
// Keys a red `main` whichever head carries it. An attempt's marker also names what the attempt was made against — the
// Collector's own source, and for a cut the `main` head — and a count reads only the markers naming the same basis: a
// Fix to the collector, or a `main` that moved, is a fresh turn for the work by itself, where a count that outlived the
// Code that failed it left every fix waiting on a person to reset it.
export const getMarker = (marker: string, key: FailureSignature | number | string, basisShas: string[] = []): string =>
  `<!-- ${marker} ${getKeyText(key)}${getBasisText(basisShas)} -->`;
