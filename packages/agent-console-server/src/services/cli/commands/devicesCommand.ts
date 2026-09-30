import type { SubCommandsDef } from "citty";

import { getReachableHostname } from "#src/services/cli/getReachableHostname";
import { hostArgs } from "#src/services/cli/hostArgs";
import { installDownloadedHost } from "#src/services/cli/installDownloadedHost";
import { writeLine } from "#src/services/cli/writeLine";
import { getStateDirectory } from "#src/services/device/getStateDirectory";
import { readHostKey } from "#src/services/device/readHostKey";
import { runDevicesCommand } from "#src/services/device/runDevicesCommand";
import { defineCommand } from "citty";

export const devicesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    hostname: hostArgs.hostname,
    port: hostArgs.port,
    revoke: { default: "", description: "A paired page's id, to remove it", type: "string" },
  },
  meta: { description: "List the pages paired with this host, or remove one", name: "devices" },
  run: async ({ args }) => {
    installDownloadedHost();
    const stateDirectory = getStateDirectory();
    const isDone = await runDevicesCommand(
      {
        hostKey: readHostKey(stateDirectory),
        hostname: getReachableHostname(args.hostname),
        port: Number(args.port),
        revokeDeviceId: args.revoke,
        stateDirectory,
      },
      writeLine,
    );
    process.exit(isDone ? 0 : 1);
  },
});
