import type { SubCommandsDef } from "citty";

import { writeFrostbearingTreeLevels } from "#src/services/genshinAssets/offerings/writeFrostbearingTreeLevels";
import { writeFrostbearingTreePlaces } from "#src/services/genshinAssets/offerings/writeFrostbearingTreePlaces";
import { defineCommand } from "citty";

export const offeringsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Frostbearing Tree's levels (the items each takes, its rewards) from the dump, and its place from the official map, into genshin-world",
    name: "offerings",
  },
  run: async () => {
    writeFrostbearingTreeLevels();
    console.log(await writeFrostbearingTreePlaces());
  },
});
