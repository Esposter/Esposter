import type { SubCommandsDef } from "citty";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildWeaponRoots } from "#src/services/genshinAssets/weapons/buildWeaponRoots";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world/definitions";

export const weaponRootsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Derive the roots that hold the held weapons' meshes from the layouts of the blocks the asset index puts them in, publish them to the game data for the weapons' component to read, and report each mesh no game object draws",
    name: "weapon-roots",
  },
  run: async ({ args }) => {
    const { notes, publication } = await buildWeaponRoots();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({ isDryRun: args["dry-run"], publication, scopes: [GameDataset.WeaponRoots] }),
    );
  },
});
