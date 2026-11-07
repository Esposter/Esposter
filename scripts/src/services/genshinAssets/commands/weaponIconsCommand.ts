import type { SubCommandsDef } from "citty";

import { exportWeaponIcons } from "#src/services/genshinAssets/weapons/exportWeaponIcons";
import { defineCommand } from "citty";

export const weaponIconsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Export the weapon icons the weapon table names into the extracted folder, and report each name the asset index holds no texture for",
    name: "weapon-icons",
  },
  run: async () => {
    console.log(await exportWeaponIcons());
  },
});
