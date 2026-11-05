import { COMPUTE_UNNAMED_BLOCKER } from "#src/services/fleet/constants";

// The words a waiting line gives after `waits on`, `input missing:` or `blocked:`, up to the end of that clause. A line
// Naming none gives the fallback, so a waiting item with no blocker is shown as one rather than as a blank
const BLOCKER_REGEX = /(?:[Ww]aits on |[Ii]nput missing: |[Bb]locked: )(?<blocker>[^:;\n]+?)(?=:|;|\. |\.$|$)/u;

// The blocker a waiting item's line names
export const parseComputeBlocker = (line: string): string =>
  BLOCKER_REGEX.exec(line)?.groups?.blocker ?? COMPUTE_UNNAMED_BLOCKER;
