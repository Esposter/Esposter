import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { formatShaderListing } from "#src/services/genshinAssets/effects/formatShaderListing";
import { listEffectShaders } from "#src/services/genshinAssets/effects/listEffectShaders";
import { readExportedShaders } from "#src/services/genshinAssets/effects/readExportedShaders";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const effectShadersCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose exported shaders to list: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "List each exported shader of a component with its keywords and the blend and depth state its passes set, naming each value by its driving property, and mark the shaders whose blend an effect uses",
    name: "effect-shaders",
  },
  run: async ({ args }) => {
    const listings = listEffectShaders(await readExportedShaders(parseDerivedAssetComponent(args.component)));
    console.log(listings.flatMap((listing) => formatShaderListing(listing)).join("\n"));
  },
});
