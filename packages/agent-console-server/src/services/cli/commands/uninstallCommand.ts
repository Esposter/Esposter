import type { SubCommandsDef } from "citty";

import { uninstallHost } from "#src/services/installer/uninstallHost";
import { defineCommand } from "citty";

export const uninstallCommand: SubCommandsDef[string] = defineCommand({
  meta: { description: "Remove the installed host, its link and its folder", name: "uninstall" },
  run: () => {
    uninstallHost();
    process.stdout.write("The host is uninstalled, and its folder is removed once this window closes.\n");
    process.exit(0);
  },
});
