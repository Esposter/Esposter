import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { extractComponentInterface } from "#src/services/genshinAssets/interface/extractComponentInterface";
import { formatInterfaceTree } from "#src/services/genshinAssets/interface/formatInterfaceTree";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
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
