import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// A title's copy in the references: its spaces are its file's underscores, as the wiki names it, and a slash in it is one too
export const getPath = (title: string): string =>
  join(REFERENCE_SCRATCH_DIRECTORY, title.slice("File:".length).replaceAll(/[ /]/gu, "_"));
