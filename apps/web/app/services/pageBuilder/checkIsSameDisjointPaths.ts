import type { JsonPatchOperation } from "@esposter/shared";

// Whether two edits set the same paths, with none of them under another: a path under another exists only once the write above it
// Has landed, so the later edit's operations cannot replay over the document an interaction began from when one takes the other's place
export const checkIsSameDisjointPaths = (operations: JsonPatchOperation[], otherOperations: JsonPatchOperation[]) => {
  const paths = new Set(operations.map(({ path }) => path));
  const otherPaths = new Set(otherOperations.map(({ path }) => path));
  return (
    paths.size === otherPaths.size &&
    [...paths].every((path) => otherPaths.has(path)) &&
    [...paths].every((path) => ![...paths].some((otherPath) => otherPath.startsWith(`${path}/`)))
  );
};
