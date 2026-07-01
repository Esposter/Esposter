import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { runPassthrough } from "@/services/cli/runPassthrough";
import { defineCommand } from "citty";
import dedent from "dedent";
// Forced plain exec: no snapshot reuse and no write-back even on the os backend — the cold sibling of `run`.
export const execCommand: CommandDef = defineCommand({
  meta: {
    description: dedent`
      Exec an executable directly through the resolved backend — the cold sibling of \`run\`: no warm-snapshot fork
      and no write-back. Same shape as run: \`virrun exec -- pnpm build\`, not \`virrun exec build\`.
    `,
    name: CommandType.Exec,
  },
  run: ({ args, cmd }) => runPassthrough(args._, cmd, ExecutionMode.Exec),
});
