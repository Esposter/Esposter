import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { runParityPasses } from "#src/services/genshinParity/passes/runParityPasses";
import { writeParityPasses } from "#src/services/genshinParity/passes/writeParityPasses";
import { defineCommand } from "citty";

export const passesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose passes to run: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Run a component's recreation passes in order, each measure against its gate, up to the first that fails or has no measure yet, and rewrite its section of ParityPasses.snapshot.md",
    name: "passes",
  },
  run: async ({ args }) => {
    const component = parseDerivedAssetComponent(args.component);
    const results = await runParityPasses(component);
    for (const { isHeld, measure, pass } of results) {
      console.log(`${pass}: ${isHeld ? "held" : "not held"}`);
      for (const { gate, name, unit, value } of measure.readings)
        console.log(`  ${name}: ${value.toFixed(4)} ${unit} against ${gate} ${value <= gate ? "held" : "FAILED"}`);
      for (const note of measure.notes) console.log(`  ${note}`);
    }
    await writeParityPasses(component, results);
  },
});
