import type { ServeHostOptions } from "#src/models/cli/ServeHostOptions";

import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { getReachableHostname } from "#src/services/cli/getReachableHostname";
import { installDownloadedHost } from "#src/services/cli/installDownloadedHost";
import { writeLine } from "#src/services/cli/writeLine";
import {
  DEFAULT_HOSTNAME,
  PAIRING_CODE_PARAMETER,
  PAIRING_HASH_PARAMETER,
  SCHEME_PAIRING_CODE_DURATION_MS,
} from "#src/services/constants";
import { PRINTED_PAIRING_CODE_DURATION_MS, SECRET_BYTE_LENGTH } from "#src/services/device/constants";
import { getStateDirectory } from "#src/services/device/getStateDirectory";
import { readHostKey } from "#src/services/device/readHostKey";
import { createClaudeAgentSdkDriver } from "#src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver";
import { createWindowDriver } from "#src/services/drivers/window/createWindowDriver";
import { launchSessionWindow } from "#src/services/drivers/window/launchSessionWindow";
import { createAgentConsoleServer } from "#src/services/server/createAgentConsoleServer";
import { sendToRunningHost } from "#src/services/server/sendToRunningHost";
import { spawnPtyShell } from "#src/services/shell/spawnPtyShell";
import { getResultAsync, RoutePath } from "@esposter/shared";
import { randomBytes } from "node:crypto";
import { once } from "node:events";

// Starts the host and prints the link that pairs a page with it, then serves until the window closes
export const serveHost = async ({ hostname, origin, port, schemeLaunch }: ServeHostOptions): Promise<void> => {
  installDownloadedHost();
  const stateDirectory = getStateDirectory();
  const hostKey = readHostKey(stateDirectory);
  const reachableHostname = getReachableHostname(hostname);
  const server = await getResultAsync(() =>
    createAgentConsoleServer({
      // This computer's sessions each run in a window of their own on Windows. A host opened to the network is a remote
      // Connection, with no desktop anyone sees, so its sessions stay inside it, as they do on every other platform
      createDriver: (callbacks) =>
        process.platform === "win32" && hostname === DEFAULT_HOSTNAME
          ? createWindowDriver(callbacks, { launchSessionWindow, stateDirectory, writeLine })
          : createClaudeAgentSdkDriver(callbacks),
      hostKey,
      hostname,
      origin,
      port,
      spawnShell: spawnPtyShell,
      stateDirectory,
      writeLine,
    }),
  ).match(
    (agentConsoleServer) => agentConsoleServer,
    async (error) => {
      if (!schemeLaunch || !("code" in error) || error.code !== "EADDRINUSE") throw error;
      // A page's Connect while a host already runs opens this second window, which hands the page's code to the running
      // One and leaves the page to it. A port held by some other program proves nothing, so it is never handed the code
      // And is said rather than a host claimed
      const { code } = schemeLaunch;
      if (
        await sendToRunningHost(
          reachableHostname,
          port,
          hostKey,
          code ? (signature) => ({ code, signature, type: HandshakeMessageType.HandOff }) : undefined,
        )
      ) {
        process.stdout.write("The host is already running in another window.\n");
        process.exit(0);
      }
      process.stderr.write(
        `Another program is using port ${port}, so the host cannot start. Close it and connect again.\n`,
      );
      process.exit(1);
    },
  );
  // A page's Connect already holds its code. A host started any other way prints a link carrying a code of its own,
  // Which pairs one page, once, within minutes, so a link left in a scrollback or a history pairs nothing. The code is
  // Printed on its own too, for a page on another computer that reaches this machine at an address of its own
  if (schemeLaunch) {
    if (schemeLaunch.code) server.addPairingCode(schemeLaunch.code, SCHEME_PAIRING_CODE_DURATION_MS);
    process.stdout.write("The host is running. Keep this window open.\n\nTo stop, close this window.\n");
  } else {
    const code = randomBytes(SECRET_BYTE_LENGTH).toString("base64url");
    server.addPairingCode(code, PRINTED_PAIRING_CODE_DURATION_MS);
    const hostAddress = `ws://${reachableHostname}:${server.port}`;
    const pairingUrl = `${origin}${RoutePath.Genshin}#${new URLSearchParams({
      [PAIRING_CODE_PARAMETER]: code,
      [PAIRING_HASH_PARAMETER]: hostAddress,
    })}`;
    process.stdout.write(
      `The host is running. Keep this window open.\n\nTo connect, press Connect on the page, or hold Ctrl and click this link in the next ten minutes:\n  ${pairingUrl}\n\nTo add this machine from another computer, enter its address and this code in the page's sessions tab:\n  ${code}\n\nTo stop, close this window.\n`,
    );
  }

  // Ctrl+C, or closing the window, which Windows reports as SIGHUP, tells every page the host is stopping and closes
  // Every session's Claude Code process before the host goes, rather than leaving them orphaned
  await Promise.race([once(process, "SIGINT"), once(process, "SIGHUP")]);
  await server.close();
};
