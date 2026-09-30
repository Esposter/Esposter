import type { SubCommandsDef } from "citty";

import { CommandType } from "#src/models/virrun/CommandType";
import { cleanCaches } from "#src/services/cli/cache/cleanCaches";
import { defineCommand } from "citty";

// `--all` also clears the host-global snapshots and task cache, shared across repos, so it is opt-in.
export const cacheCleanCommand: SubCommandsDef[string] = defineCommand({
  args: {
    all: {
      default: false,
      description: "Also remove the host-global ~/.virrun/snapshots and task cache.",
      type: "boolean",
    },
  },
  meta: {
    description: "Remove the repo-local .virrun cache; --all also clears host-global warm snapshots.",
    name: CommandType.Clean,
  },
  run: ({ args }) => {
    cleanCaches(args.all);
  },
});
