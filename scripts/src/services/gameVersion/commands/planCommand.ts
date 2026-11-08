import type { SubCommandsDef } from "citty";

import { planStaleRows } from "#src/services/gameVersion/planStaleRows";
import { readInstallStaleRows } from "#src/services/gameVersion/readInstallStaleRows";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { defineCommand } from "citty";

export const planCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Print each stale command once, under the kind it belongs to, in the order an update runs them: extractions, the map, the fits, then the publishes",
    name: "plan",
  },
  run: async () => {
    const sections = planStaleRows(await readInstallStaleRows(await readGameVersion()));
    if (sections.length === 0) console.log("no output is stale");
    for (const { commands, heading } of sections) {
      console.log(`${heading}:`);
      for (const command of commands) console.log(`  ${command}`);
    }
  },
});
