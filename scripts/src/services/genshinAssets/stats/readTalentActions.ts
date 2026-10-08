import { TALENT_CONFIG_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every talent config's actions in the dump, keyed by the config name a talent row names in its `openConfig`. The
// Configs are filed by character in the community's repository, but a few sit in files of their own, so every file of
// The folder is read rather than one named after each character. A name held twice is refused, since it would hide one
export const readTalentActions = (): Map<string, Record<string, unknown>[]> => {
  const actionMap = new Map<string, Record<string, unknown>[]>();
  for (const fileName of readdirSync(TALENT_CONFIG_DIRECTORY)) {
    const config = parseMachineJson<Record<string, Record<string, unknown>[]>>(
      readFileSync(join(TALENT_CONFIG_DIRECTORY, fileName), "utf8"),
    );
    for (const [name, actions] of Object.entries(config)) {
      if (actionMap.has(name))
        throw new InvalidOperationError(Operation.Read, readTalentActions.name, `${name} held by two files`);
      actionMap.set(name, actions);
    }
  }
  return actionMap;
};
