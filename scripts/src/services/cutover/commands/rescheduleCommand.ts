import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runReschedule } from "#src/services/cutover/reschedule/runReschedule";
import { defineCommand } from "citty";

export const rescheduleCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: {
    description:
      "Ask the functions Worker to arm the pending message reminders and the copied TodoList reminders on their owners' objects. In the freeze, after copy-tables --delta",
    name: "reschedule",
  },
  run: async ({ args }) => {
    await runReschedule(args.environment);
  },
});
