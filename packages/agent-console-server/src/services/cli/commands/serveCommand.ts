import type { SubCommandsDef } from "citty";

import { hostArgs } from "#src/services/cli/hostArgs";
import { serveHost } from "#src/services/cli/serveHost";
import { defineCommand } from "citty";

export const serveCommand: SubCommandsDef[string] = defineCommand({
  args: { ...hostArgs },
  meta: { description: "Start the host and print the link that pairs a page with it", name: "serve" },
  run: ({ args }) => serveHost({ hostname: args.hostname, origin: args.origin, port: Number(args.port) }),
});
