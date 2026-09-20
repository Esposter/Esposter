import { ADDED_VERBS_PATH } from "#src/services/constants";
import { rmSync } from "node:fs";

export const deleteAddedVerbs = (): void => {
  rmSync(ADDED_VERBS_PATH, { force: true });
};
