import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runVerify } from "#src/services/cutover/verify/runVerify";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: {
    description: "Compare the copy with the source row by row, bucket by bucket, and fail on the first difference",
    name: "verify",
  },
  run: async ({ args }) => {
    await runVerify(args.environment);
  },
});
