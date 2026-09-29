import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import {
  DEFAULT_APP_ORIGIN,
  DEFAULT_HOSTNAME,
  DEFAULT_PORT,
  PAIRING_CODE_PARAMETER,
  PAIRING_HASH_PARAMETER,
  SCHEME_PAIRING_CODE_DURATION,
} from "#src/services/constants";
import { PRINTED_PAIRING_CODE_DURATION, SECRET_BYTE_LENGTH } from "#src/services/device/constants";
import { getStateDirectory } from "#src/services/device/getStateDirectory";
import { readHostKey } from "#src/services/device/readHostKey";
import { runDevicesCommand } from "#src/services/device/runDevicesCommand";
import { createClaudeAgentSdkDriver } from "#src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver";
import { SESSION_SUBCOMMAND } from "#src/services/drivers/window/constants";
import { createWindowDriver } from "#src/services/drivers/window/createWindowDriver";
import { launchSessionWindow } from "#src/services/drivers/window/launchSessionWindow";
import { runSessionChild } from "#src/services/drivers/window/runSessionChild";
import { checkIsHostInstalled } from "#src/services/installer/checkIsHostInstalled";
import { checkIsSchemeLaunchTampered } from "#src/services/installer/checkIsSchemeLaunchTampered";
import { getSchemeLaunch } from "#src/services/installer/getSchemeLaunch";
import { installHost } from "#src/services/installer/installHost";
import { uninstallHost } from "#src/services/installer/uninstallHost";
import { createAgentConsoleServer } from "#src/services/server/createAgentConsoleServer";
import { sendToRunningHost } from "#src/services/server/sendToRunningHost";
import { CONSOLE_LIST_AGENT_NAME } from "#src/services/shell/constants";
import { runConsoleListAgent } from "#src/services/shell/runConsoleListAgent";
import { spawnPtyShell } from "#src/services/shell/spawnPtyShell";
import { getResult, getResultAsync, RoutePath } from "@esposter/shared";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { hostname as getMachineName } from "node:os";
import { basename } from "node:path";
import { isSea } from "node:sea";
import { parseArgs } from "node:util";

// `agent-console-server [--port <port>] [--hostname <address>] [--origin <app origin>]` — starts the host and
// Prints the link that pairs a page with it. `--hostname 0.0.0.0` is what lets another machine reach it. The Windows
// Executable also takes `uninstall`, and the `esposter-host://` link Windows starts it with from a page's Connect;
// `session` is what each session's window runs. `devices [--revoke <id>]` lists the paired pages or removes one
if (checkIsSchemeLaunchTampered(process.argv.slice(2))) {
  process.stderr.write("This link tried to start the host with settings of its own, so it was not started.\n");
  process.exit(1);
}
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    hostname: { default: DEFAULT_HOSTNAME, type: "string" },
    origin: { default: DEFAULT_APP_ORIGIN, type: "string" },
    port: { default: String(DEFAULT_PORT), type: "string" },
    revoke: { default: "", type: "string" },
  },
});
const [firstPositional = ""] = positionals;
const writeLine = (line: string) => {
  process.stdout.write(`${line}
`);
};
// Node-pty's console-list agent, forked while a shell ends, which from inside the executable runs the executable again
if (basename(firstPositional) === CONSOLE_LIST_AGENT_NAME) {
  runConsoleListAgent(Number(positionals[1]));
  process.exit(0);
}
// A session's window, started by the host it connects back to
if (firstPositional === SESSION_SUBCOMMAND) {
  await runSessionChild(Number(values.port), writeLine);
  process.exit(0);
}
if (firstPositional === "uninstall") {
  uninstallHost();
  process.stdout.write("The host is uninstalled, and its folder is removed once this window closes.\n");
  process.exit(0);
}
// A download run from anywhere installs itself first, then serves from this window as the installed host would. An
// Install that cannot finish — most often an older host still running from the install folder, whose files Windows
// Keeps locked — says what to do rather than failing with a stack
if (isSea() && !checkIsHostInstalled())
  getResult(() => installHost()).match(
    (installDirectory) => {
      process.stdout.write(`Installed the host in ${installDirectory}. The page's Connect starts it from now on.\n\n`);
    },
    (error) => {
      process.stderr.write(
        `Could not install the host: ${error.message}\nClose any other host window, then open this file again.\n`,
      );
      process.exit(1);
    },
  );
const schemeLaunch = getSchemeLaunch(firstPositional);
const stateDirectory = getStateDirectory();
const hostKey = readHostKey(stateDirectory);
const port = Number(values.port);
// A host listening on every interface is reached by the machine's own name, not the wildcard it bound
const reachableHostname = values.hostname === "0.0.0.0" ? getMachineName() : values.hostname;
if (firstPositional === "devices")
  process.exit(
    (await runDevicesCommand(
      { hostKey, hostname: reachableHostname, port, revokeDeviceId: values.revoke, stateDirectory },
      writeLine,
    ))
      ? 0
      : 1,
  );
const server = await getResultAsync(() =>
  createAgentConsoleServer({
    // This computer's sessions each run in a window of their own on Windows. A host opened to the network is a remote
    // Connection, with no desktop anyone sees, so its sessions stay inside it, as they do on every other platform
    createDriver: (callbacks) =>
      process.platform === "win32" && values.hostname === DEFAULT_HOSTNAME
        ? createWindowDriver(callbacks, { launchSessionWindow, stateDirectory, writeLine })
        : createClaudeAgentSdkDriver(callbacks),
    hostKey,
    hostname: values.hostname,
    origin: values.origin,
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
  if (schemeLaunch.code) server.addPairingCode(schemeLaunch.code, SCHEME_PAIRING_CODE_DURATION);
  process.stdout.write("The host is running. Keep this window open.\n\nTo stop, close this window.\n");
} else {
  const code = randomBytes(SECRET_BYTE_LENGTH).toString("base64url");
  server.addPairingCode(code, PRINTED_PAIRING_CODE_DURATION);
  const hostAddress = `ws://${reachableHostname}:${server.port}`;
  const pairingUrl = `${values.origin}${RoutePath.Genshin}#${new URLSearchParams({
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
