import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { DerivedAssetFitMap } from "#src/services/genshinAssets/DerivedAssetFitMap";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const fitCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component to fit: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Fit our own parameters to a component's exports and write them as the world's data",
    name: "fit",
  },
  run: async ({ args }) => {
    console.log(await DerivedAssetFitMap[parseDerivedAssetComponent(args.component)]());
  },
});
