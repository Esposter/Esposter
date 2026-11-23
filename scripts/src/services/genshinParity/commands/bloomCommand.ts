import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { buildBloomAblationTable } from "#src/services/genshinParity/passes/buildBloomAblationTable";
import { readBloomAblation } from "#src/services/genshinParity/passes/readBloomAblation";
import { defineCommand } from "citty";

// The bloom ablation: the Display pass's bloom reading over each structure of the bloom chain, at the display width and
// At The reference's own width resized, as a table. Its last line is the rows as JSON
export const bloomCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Read the Display pass's bloom reading over every structure of the game's bloom chain, at each measurement, and print the table",
    name: "bloom",
  },
  run: async () => {
    const rows = await readBloomAblation(DerivedAssetComponent.Login);
    console.log(buildBloomAblationTable(rows));
    console.log(JSON.stringify(rows));
  },
});
