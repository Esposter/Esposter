import type { SessionWindowLaunch } from "#src/models/window/SessionWindowLaunch";

import { SESSION_SECRET_ENVIRONMENT_VARIABLE, SESSION_SUBCOMMAND } from "#src/services/drivers/window/constants";
import { SITE_NAME } from "@esposter/shared";
import { spawn } from "node:child_process";
import { isSea } from "node:sea";

const SESSION_COMMAND_ENVIRONMENT_VARIABLE_PREFIX = `${SITE_NAME.toUpperCase()}_SESSION_COMMAND_`;

// Starts `<host> session` in a console window of its own through cmd's `start`, which Windows 11 opens in Terminal.
// The secret reaches the window through its environment, never its command line, so nothing lists it. The host's own
// Paths reach cmd the same way and are read back quoted, so no command line is built from a path
export const launchSessionWindow = ({ port, secret }: SessionWindowLaunch): void => {
  // The executable itself, or node running this package's bin while developing
  // oxlint-disable-next-line no-restricted-properties -- node puts the running script first in argv, which is the host
  const hostCommand = isSea() ? [process.execPath] : [process.execPath, process.argv[1] ?? ""];
  const quotedHostCommand = hostCommand
    .map((_, index) => `"%${SESSION_COMMAND_ENVIRONMENT_VARIABLE_PREFIX}${index}%"`)
    .join(" ");
  spawn("cmd.exe", ["/d", "/s", "/c", `"start "" ${quotedHostCommand} ${SESSION_SUBCOMMAND} --port ${port}"`], {
    env: {
      ...process.env,
      ...Object.fromEntries(
        hostCommand.map((part, index) => [`${SESSION_COMMAND_ENVIRONMENT_VARIABLE_PREFIX}${index}`, part]),
      ),
      [SESSION_SECRET_ENVIRONMENT_VARIABLE]: secret,
    },
    stdio: "ignore",
    windowsVerbatimArguments: true,
  }).on("error", console.error);
};
