import { ADDED_VERBS_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeAddedVerbs = (verbs: string[]): void => {
  writeStateFile(ADDED_VERBS_PATH, verbs.join("\n"));
};
