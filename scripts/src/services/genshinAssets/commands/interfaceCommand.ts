import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { extractComponentInterface } from "#src/services/genshinAssets/extractComponentInterface";
import { formatInterfaceTree } from "#src/services/genshinAssets/formatInterfaceTree";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const interfaceCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose interface to lay out: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Export a screen's interface tree with each piece's anchors, pivot, position and size",
    name: "interface",
  },
  run: async ({ args }) => {
    console.log(formatInterfaceTree(await extractComponentInterface(parseDerivedAssetComponent(args.component))));
  },
});
