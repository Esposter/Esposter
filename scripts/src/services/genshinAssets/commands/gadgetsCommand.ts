import type { SubCommandsDef } from "citty";

import { writeGadgetRows } from "#src/services/genshinAssets/gadgets/writeGadgetRows";
import { defineCommand } from "citty";

export const gadgetsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the gadgets the widget config builds (their kind, cooldowns and cooldown group) from the dump into genshin-world",
    name: "gadgets",
  },
  run: () => {
    writeGadgetRows();
  },
});
