import type { ShellCommand } from "#src/models/command/ShellCommand";
import type { ShellRegistry } from "#src/models/shell/ShellRegistry";

import { CommandType } from "#src/models/command/CommandType";
import { exhaustiveGuard } from "@esposter/shared";

// A page's shell command, run against the host's own shells rather than the driver. Opening one resolves to the shell
// It opened; every other command's effect arrives as the shell's output, so it resolves to nothing
export const handleShellCommand = async (shellRegistry: ShellRegistry, command: ShellCommand): Promise<string> => {
  switch (command.type) {
    case CommandType.CloseShell:
      shellRegistry.close(command.shellId);
      return "";
    case CommandType.OpenShell: {
      const shellId = await shellRegistry.open(command.sessionId, {
        cols: command.cols,
        cwd: command.cwd,
        rows: command.rows,
      });
      return shellId;
    }
    case CommandType.ShellInput:
      shellRegistry.write(command.shellId, command.data);
      return "";
    case CommandType.ShellResize:
      shellRegistry.resize(command.shellId, command.cols, command.rows);
      return "";
    default:
      return exhaustiveGuard(command);
  }
};
