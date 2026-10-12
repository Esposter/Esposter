import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { formatReadingValue } from "#src/services/genshinParity/passes/formatReadingValue";
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
    pass: {
      description:
        "One pass's measure alone, for a pass taken up ahead of one before it that still fails, rewriting only its own rows of the component's report",
      options: Object.values(ParityPass),
      type: "enum",
    },
  },
  meta: {
    description:
      "Run a component's recreation passes in order, each measure against its gate, up to the first that fails or has no measure yet, and rewrite its report in passes/snapshots",
    name: "passes",
  },
  run: async ({ args }) => {
    const component = parseDerivedAssetComponent(args.component);
    const results = await runParityPasses(component, args.pass);
    for (const {
      isHeld,
      measure: { notes, readings },
      pass,
    } of results) {
      console.log(`${pass}: ${isHeld ? "held" : "not held"}`);
      for (const reading of readings)
        console.log(
          `  ${reading.name}: ${formatReadingValue(reading)} ${reading.unit} against ${formatPassValue(reading.gate)} ${checkIsReadingHeld(reading) ? "held" : "FAILED"}`,
        );
      for (const note of notes) console.log(`  ${note}`);
    }
    await writeParityPasses(component, results, { isPassAlone: args.pass !== undefined });
  },
});
