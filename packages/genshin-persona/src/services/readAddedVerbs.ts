import { ADDED_VERBS_PATH } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// Absent until the first `setup` and deleted by `teardown`, so no record means the plugin has added no verb and
// Teardown removes none
export const readAddedVerbs = (): string[] =>
  existsSync(ADDED_VERBS_PATH) ? readFileSync(ADDED_VERBS_PATH, "utf8").split("\n").filter(Boolean) : [];
