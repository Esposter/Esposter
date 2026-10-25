import { PROGRAM_SUFFIX } from "#src/services/proposals/constants";

// A change's own program is its umbrella, never something it waits on
export const checkIsProgramOf = (linkedId: string, id: string): boolean =>
  linkedId.endsWith(PROGRAM_SUFFIX) && id.startsWith(`${linkedId.slice(0, -PROGRAM_SUFFIX.length)}-`);
