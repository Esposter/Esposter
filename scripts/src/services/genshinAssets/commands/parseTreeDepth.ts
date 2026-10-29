import { parseWholeCount } from "#src/services/shared/parseWholeCount";

// A depth is a whole count of levels, or every level when none is given. One that is no count would prune every child of a
// Scene tree or print no levels of an interface one, so it is refused rather than read
export const parseTreeDepth = (depth: string | undefined): number =>
  depth === undefined ? Infinity : parseWholeCount(depth, "depth", 0);
