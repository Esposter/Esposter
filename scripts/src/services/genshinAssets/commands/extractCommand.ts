import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { extractComponent } from "#src/services/genshinAssets/blocks/extractComponent";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const extractCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component to export: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Export a component's closure: its roots' layout per file, then every mesh, material and texture they reach through their pointers, printing what could not be resolved",
    name: "extract",
  },
  run: async ({ args }) => {
    console.log(await extractComponent(parseDerivedAssetComponent(args.component)));
  },
});
