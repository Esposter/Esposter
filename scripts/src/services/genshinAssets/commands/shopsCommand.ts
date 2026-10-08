import type { SubCommandsDef } from "citty";

import { writePaimonsBargainsGoods } from "#src/services/genshinAssets/shops/writePaimonsBargainsGoods";
import { defineCommand } from "citty";

export const shopsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write Paimon's Bargains' Fates bought with Masterless Starglitter or Stardust from the dump into genshin-world",
    name: "shops",
  },
  run: () => {
    writePaimonsBargainsGoods();
  },
});
