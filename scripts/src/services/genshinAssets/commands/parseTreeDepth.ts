import { InvalidOperationError, Operation } from "@esposter/shared";

// A depth is a whole count of levels, or every level when none is given. One that is no count would prune every child of a
// Scene tree or print no levels of an interface one, so it is refused rather than read
export const parseTreeDepth = (depth: string | undefined): number => {
  if (depth === undefined) return Infinity;

  const levels = Number(depth);
  if (!Number.isInteger(levels) || levels < 0)
    throw new InvalidOperationError(Operation.Read, "depth", `not a whole number of levels: ${depth}`);
  return levels;
};
