import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { checkArrangement } from "#src/services/genshinAssets/checkArrangement";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const arrangementCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose arrangement to check: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Check a component's arrangement with no pixels: each ratio's cross-ratio on its reference against the fitted data's, and each fitted family's distance from the exports' objects it stands for",
    name: "arrangement",
  },
  run: async ({ args }) => {
    const { families, ratios } = await checkArrangement(parseDerivedAssetComponent(args.component));
    for (const { fitted, measured, name, reference } of ratios)
      console.log(
        `${name} (${reference}): measured ${measured.toFixed(4)}, fitted ${fitted.toFixed(4)}, residual ${Math.abs(fitted - measured).toFixed(4)}`,
      );
    for (const { count, largest, mean, name } of families)
      console.log(
        `${name}: ${count} fitted, ${mean.toFixed(2)} m from the exports on average, ${largest.toFixed(2)} m at most`,
      );
  },
});
