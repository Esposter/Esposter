import { GENSHIN_SESSIONS_DIRECTORY } from "#src/services/genshinProgress/constants";
import { parseScriptQuestIds } from "#src/services/genshinProgress/parseScriptQuestIds";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// The quests the session scripts name, read off the working tree from each `.ts` file of the sessions folder, and none
// While the folder is absent
export const readScriptedQuestIds = (): string[] => {
  const directory = resolve(REPOSITORY_ROOT, GENSHIN_SESSIONS_DIRECTORY);
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((file) => file.endsWith(".ts"))
    .flatMap((file) => parseScriptQuestIds(readFileSync(join(directory, file), "utf8")));
};
