import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readPathClearance } from "#src/services/genshinAssets/scene/readPathClearance";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

export const clearanceCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose witness layout to read: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    at: { default: "0,1.27", description: "The path's x and y in three's axes, along +z", type: "string" },
  },
  meta: {
    description:
      "Where a straight path along +z through a component's exports passes through them: each part it pierces and the depths it enters and leaves at",
    name: "clearance",
  },
  run: async ({ args }) => {
    const [x = 0, y = 0] = parseNumbers(args.at, "at", 2);
    const pierced = await readPathClearance(parseDerivedAssetComponent(args.component), [x, y]);
    for (const { depths, mesh, position } of pierced)
      console.log(`${mesh} at ${position.map((value) => value.toFixed(1)).join(",")}: z ${depths.join(", ")}`);
    console.log(`${pierced.length} parts pierced`);
  },
});
