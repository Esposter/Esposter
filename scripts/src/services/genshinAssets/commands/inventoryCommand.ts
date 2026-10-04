import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { writeComponentInventory } from "#src/services/genshinAssets/materials/writeComponentInventory";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const inventoryCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component to inventory: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Report everything a component's export holds: materials, textures, meshes and shaders",
    name: "inventory",
  },
  run: async ({ args }) => {
    console.log(await writeComponentInventory(parseDerivedAssetComponent(args.component)));
  },
});
