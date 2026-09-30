import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { writeWitnessLayout } from "#src/services/genshinAssets/writeWitnessLayout";
import { defineCommand } from "citty";

export const witnessCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component to lay out: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    roots: { description: "Roots to lay out in place of the component's own, comma separated", type: "string" },
  },
  meta: {
    description: "Lay a component's exports out as the witness render draws them, beside the exports",
    name: "witness",
  },
  run: async ({ args }) => {
    console.log(await writeWitnessLayout(parseDerivedAssetComponent(args.component), args.roots?.split(",")));
  },
});
