import type { SubCommandsDef } from "citty";

import { exportWeaponRoots } from "#src/services/genshinAssets/weapons/exportWeaponRoots";
import { defineCommand } from "citty";

export const weaponRootsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Derive the roots that hold the held weapons' meshes from the layouts of the blocks the asset index puts them in, write them to the record the weapons' component reads, and report each mesh no game object draws",
    name: "weapon-roots",
  },
  run: async () => {
    console.log(await exportWeaponRoots());
  },
});
