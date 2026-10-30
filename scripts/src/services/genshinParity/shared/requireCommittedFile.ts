import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { relative } from "node:path";

// A reference's committed file at a path, which must be on disk.
// One missing is refused with the path to add it at, and the advice that says how.
export const requireCommittedFile = (referenceId: string, path: string, kind: string, advice: string): string => {
  if (!existsSync(path))
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `has no committed ${kind} at ${relative(REPOSITORY_ROOT, path)}: ${advice}`,
    );
  return path;
};
