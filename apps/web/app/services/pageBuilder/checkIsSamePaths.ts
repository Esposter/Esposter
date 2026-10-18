import type { JsonPatchOperation } from "@esposter/shared";

// Whether two edits set the same paths, so the later one can take the earlier one's place
export const checkIsSamePaths = (operations: JsonPatchOperation[], otherOperations: JsonPatchOperation[]) => {
  const paths = new Set(operations.map(({ path }) => path));
  const otherPaths = new Set(otherOperations.map(({ path }) => path));
  return paths.size === otherPaths.size && [...paths].every((path) => otherPaths.has(path));
};
