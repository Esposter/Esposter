import type { SubCommandsDef } from "citty";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { findMovedFrozenPass } from "#src/services/genshinParity/passes/findMovedFrozenPass";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { formatReadingValue } from "#src/services/genshinParity/passes/formatReadingValue";
import { readParityPassRows, writeParityPasses } from "#src/services/genshinParity/passes/writeParityPasses";
import { runParityPasses } from "#src/services/genshinParity/passes/runParityPasses";
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
        "Run the passes up to and including this one, refused while an earlier pass still fails, and rewrite only the rows of the passes run",
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
    const recordedRows = await readParityPassRows(component);
    const results = await runParityPasses(component, args.pass);
    const movedPass = findMovedFrozenPass({ passAlone: args.pass, recordedRows, results });
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
    if (movedPass)
      throw new InvalidOperationError(
        Operation.Update,
        "passes",
        `${movedPass} is frozen, and ${args.pass} moved it: reopen ${movedPass} rather than compensating for it`,
      );
    await writeParityPasses(component, results, { isPassAlone: args.pass !== undefined });
  },
});
