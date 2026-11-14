import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runRewriteUrls } from "#src/services/cutover/urls/runRewriteUrls";
import { defineCommand } from "citty";

export const rewriteUrlsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: {
    description: "Rewrite every stored absolute Azure blob URL to its public asset URL",
    name: "rewrite-urls",
  },
  run: async () => {
    await runRewriteUrls();
  },
});
