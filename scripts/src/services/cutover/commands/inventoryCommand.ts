import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runInventory } from "#src/services/cutover/inventory/runInventory";
import { defineCommand } from "citty";

export const inventoryCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: {
    description:
      "Count the rows, entities, objects and bytes the copy moves, and estimate its duration; writes nothing",
    name: "inventory",
  },
  run: async () => {
    await runInventory();
  },
});
