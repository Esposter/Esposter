import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { DuplicateLiteralFinding } from "#src/models/sweeps/duplicateLiteral/DuplicateLiteralFinding";

const LITERAL_REGEX = /"[a-zA-Z][a-zA-Z0-9 ./_-]{4,}"/gu;

// Counts the files a literal appears in, not its occurrences, so a literal one file repeats is not a duplicate
export const getDuplicateLiteralFindings = (files: QueueFile[]): DuplicateLiteralFinding[] => {
  const literalPathsMap = new Map<string, Set<string>>();
  for (const { path, text } of files)
    for (const [literal] of text.matchAll(LITERAL_REGEX))
      literalPathsMap.set(literal, (literalPathsMap.get(literal) ?? new Set<string>()).add(path));
  return [...literalPathsMap]
    .filter(([, paths]) => paths.size > 1)
    .map(([literal, paths]) => ({ count: paths.size, literal, paths: [...paths] }))
    .toSorted((firstFinding, secondFinding) => secondFinding.count - firstFinding.count);
};
