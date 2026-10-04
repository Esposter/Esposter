import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { extractComponentShaders } from "#src/services/genshinAssets/materials/extractComponentShaders";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const shadersCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose shaders to export: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Export the shaders a component's materials draw with, and disassemble their programs",
    name: "shaders",
  },
  run: async ({ args }) => {
    console.log((await extractComponentShaders(parseDerivedAssetComponent(args.component))).join("\n"));
  },
});
