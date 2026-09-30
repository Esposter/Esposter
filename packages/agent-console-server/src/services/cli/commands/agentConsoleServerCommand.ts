import type { CommandDef } from "citty";

import { devicesCommand } from "#src/services/cli/commands/devicesCommand";
import { serveCommand } from "#src/services/cli/commands/serveCommand";
import { sessionCommand } from "#src/services/cli/commands/sessionCommand";
import { uninstallCommand } from "#src/services/cli/commands/uninstallCommand";
import { serveHost } from "#src/services/cli/serveHost";
import { DEFAULT_APP_ORIGIN, DEFAULT_HOSTNAME, DEFAULT_PORT } from "#src/services/constants";
import { SESSION_SUBCOMMAND } from "#src/services/drivers/window/constants";
import { checkIsSchemeLaunchTampered } from "#src/services/installer/checkIsSchemeLaunchTampered";
import { getSchemeLaunch } from "#src/services/installer/getSchemeLaunch";
import { CONSOLE_LIST_AGENT_NAME } from "#src/services/shell/constants";
import { runConsoleListAgent } from "#src/services/shell/runConsoleListAgent";
import { defineCommand } from "citty";
import { basename } from "node:path";

// Two launches are made by other programs rather than typed, and carry no subcommand citty could dispatch: node-pty's
// Console-list agent, forked while a shell ends, which from inside the executable runs the executable again with the
// Agent's path first, and the `esposter-host://` link Windows starts the host with from a page's Connect. `setup` runs
// Before dispatch, so both are served there, after a link that brought flags of its own is refused
export const agentConsoleServerCommand: CommandDef = defineCommand({
  default: "serve",
  meta: {
    description: "The agent console's host: Claude Code sessions for a paired page",
    name: "agent-console-server",
  },
  setup: async ({ rawArgs }) => {
    if (checkIsSchemeLaunchTampered(rawArgs)) {
      process.stderr.write("This link tried to start the host with settings of its own, so it was not started.\n");
      process.exit(1);
    }
    const [firstArgument = "", secondArgument = ""] = rawArgs;
    if (basename(firstArgument) === CONSOLE_LIST_AGENT_NAME) {
      runConsoleListAgent(Number(secondArgument));
      process.exit(0);
    }
    const schemeLaunch = getSchemeLaunch(firstArgument);
    if (!schemeLaunch) return;
    await serveHost({ hostname: DEFAULT_HOSTNAME, origin: DEFAULT_APP_ORIGIN, port: DEFAULT_PORT, schemeLaunch });
    process.exit(0);
  },
  subCommands: {
    devices: devicesCommand,
    serve: serveCommand,
    [SESSION_SUBCOMMAND]: sessionCommand,
    uninstall: uninstallCommand,
  },
});
