import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { writeDomainEntrances } from "#src/services/genshinAssets/domains/writeDomainEntrances";
import { defineCommand } from "citty";

export const domainsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Write each challenge domain's entrance of the open world into its region's landmarks, placed from the scene's points in the dump",
    name: "domains",
  },
  run: async ({ args }) => {
    console.log(await writeDomainEntrances({ isDryRun: args["dry-run"] }));
  },
});
