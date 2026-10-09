import type { SubCommandsDef } from "citty";

import { exportNamecards } from "#src/services/genshinAssets/namecards/exportNamecards";
import { defineCommand } from "citty";

export const namecardsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Export the namecards' art and icons the asset index names into the references folder, unless it matches",
    name: "namecards",
  },
  run: async () => {
    console.log(await exportNamecards());
  },
});
