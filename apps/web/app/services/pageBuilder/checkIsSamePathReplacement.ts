import type { JsonPatchOperation } from "@esposter/shared";

import { JsonPatchOperationType } from "@esposter/shared";

const checkIsReplacement = ({ op }: JsonPatchOperation) =>
  op === JsonPatchOperationType.Add || op === JsonPatchOperationType.Replace;

// Whether two edits only set values, and set the same paths, so the later one can take the earlier one's place
export const checkIsSamePathReplacement = (operations: JsonPatchOperation[], otherOperations: JsonPatchOperation[]) => {
  const paths = new Set(operations.map(({ path }) => path));
  const otherPaths = new Set(otherOperations.map(({ path }) => path));
  return (
    [...operations, ...otherOperations].every((operation) => checkIsReplacement(operation)) &&
    paths.size === otherPaths.size &&
    [...paths].every((path) => otherPaths.has(path))
  );
};
