import type { SubCommandsDef } from "citty";

import { MONSTER_CONTROLLER_BLOCK_MAP } from "#src/services/genshinAssets/enemies/constants";
import { nameMonsterAssets } from "#src/services/genshinAssets/enemies/nameMonsterAssets";
import { readAnimationClipNames } from "#src/services/genshinAssets/enemies/readAnimationClipNames";
import { readMonsterControllerStates } from "#src/services/genshinAssets/enemies/readMonsterControllerStates";
import { readPlacedMonsterRows } from "#src/services/genshinAssets/enemies/readPlacedMonsterRows";
import { formatRoundedValue } from "#src/services/genshinAssets/shared/formatRoundedValue";
import { readClipTimings } from "#src/services/genshinAssets/timings/readClipTimings";
import { readAssetPathNames } from "#src/services/genshinAssets/world/readAssetPathNames";
import { defineCommand } from "citty";
import { basename } from "node:path";

// Each recorded controller's states, the clips each state's blend tree plays, and the events each clip fires
const printControllerStates = async (controllerName: string): Promise<void> => {
  const states = await readMonsterControllerStates(controllerName);
  const clipNames = await readAnimationClipNames(new Set(states.flatMap(({ clipPathIds }) => clipPathIds)));
  for (const { clipPathIds, name } of states)
    console.log(`  ${name}: ${clipPathIds.map((pathId) => clipNames.get(pathId) ?? pathId).join(", ")}`);
  for (const { duration, events, name } of await readClipTimings(
    `^(${Array.from(clipNames.values(), (clipName) => RegExp.escape(clipName)).join("|")})$`,
  )) {
    console.log(`  ${name}: ${formatRoundedValue(duration)} s`);
    for (const { functionName, time } of events) console.log(`    ${formatRoundedValue(time)} s ${functionName}`);
  }
};

export const monstersCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Name the prefab, Animator controller and combat config of each enemy kind the regions place and of each boss through the asset index, one line per kind, count each path hash the index names none of, and print the states, clips and clip events of each controller the controller record names",
    name: "monsters",
  },
  run: async () => {
    const monsterRows = await readPlacedMonsterRows();
    const pathNames = await readAssetPathNames();
    const controllerNames = new Set<string>();
    let unnamed = 0;
    for (const monsterRow of monsterRows) {
      const { combatConfig, controller, prefab, unnamed: unnamedHashes } = nameMonsterAssets(monsterRow, pathNames);
      unnamed += unnamedHashes;
      if (controller !== undefined) controllerNames.add(basename(controller));
      console.log(
        `${monsterRow.id} ${monsterRow.monsterName}: prefab ${prefab ?? "unnamed"}, controller ${controller ?? "unnamed"}, combat config ${combatConfig ?? "unnamed"}`,
      );
    }
    console.log(`${unnamed} path hashes unnamed`);
    for (const controllerName of controllerNames)
      if (MONSTER_CONTROLLER_BLOCK_MAP[controllerName] !== undefined) {
        console.log(`${controllerName} states:`);
        await printControllerStates(controllerName);
      }
  },
});
