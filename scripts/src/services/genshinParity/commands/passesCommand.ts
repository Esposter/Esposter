import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { ParityPassMeasureMap } from "#src/services/genshinParity/passes/ParityPassMeasureMap";
import { runParityPasses } from "#src/services/genshinParity/passes/runParityPasses";
import { writeParityPasses } from "#src/services/genshinParity/passes/writeParityPasses";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

const logMeasure = ({ notes, readings }: ParityPassMeasure): void => {
  for (const { gate, name, unit, value } of readings)
    console.log(
      `  ${name}: ${value.toFixed(4)} ${unit} against ${formatPassValue(gate)} ${value <= gate ? "held" : "FAILED"}`,
    );
  for (const note of notes) console.log(`  ${note}`);
};

export const passesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose passes to run: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    pass: {
      description:
        "One pass's measure alone, printed and not written, for a pass taken up ahead of one before it that still fails",
      options: Object.values(ParityPass),
      type: "enum",
    },
  },
  meta: {
    description:
      "Run a component's recreation passes in order, each measure against its gate, up to the first that fails or has no measure yet, and rewrite its section of ParityPasses.snapshot.md",
    name: "passes",
  },
  run: async ({ args }) => {
    const component = parseDerivedAssetComponent(args.component);
    if (args.pass) {
      const measurePass = ParityPassMeasureMap[args.pass];
      if (!measurePass) throw new InvalidOperationError(Operation.Read, args.pass, "no measure yet");
      logMeasure(await measurePass(component));
      return;
    }
    const results = await runParityPasses(component);
    for (const { isHeld, measure, pass } of results) {
      console.log(`${pass}: ${isHeld ? "held" : "not held"}`);
      logMeasure(measure);
    }
    await writeParityPasses(component, results);
  },
});
