import type { CommandDef } from "citty";

import { CommandType } from "#src/models/virrun/CommandType";
import { ExecutionMode } from "#src/models/virrun/ExecutionMode";
import { runPassthrough } from "#src/services/cli/run/runPassthrough";
import { defineCommand } from "citty";
import dedent from "dedent";
// Forced plain exec: no snapshot reuse and no write-back even on the os backend — the cold sibling of `run`.
export const execCommand: CommandDef = defineCommand({
  meta: {
    description: dedent`
      Exec an executable directly through the resolved backend — the cold sibling of \`run\`: no warm-cache fork
      and no write-back. Same shape as run: \`virrun exec -- pnpm build\`, not \`virrun exec build\`.
    `,
    name: CommandType.Exec,
  },
  run: ({ args, cmd }) => runPassthrough(args._, cmd, ExecutionMode.Exec),
});
