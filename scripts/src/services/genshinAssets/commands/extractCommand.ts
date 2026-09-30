import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { extractComponent } from "#src/services/genshinAssets/extractComponent";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const extractCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component to export: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: { description: "Export a component's assets and layout from the blocks holding them", name: "extract" },
  run: ({ args }) => extractComponent(parseDerivedAssetComponent(args.component)),
});
