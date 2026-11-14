import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runReschedule } from "#src/services/cutover/reschedule/runReschedule";
import { defineCommand } from "citty";

export const rescheduleCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: { description: "Ask the functions Worker to schedule every pending scheduled message job", name: "reschedule" },
  run: async () => {
    await runReschedule();
  },
});
