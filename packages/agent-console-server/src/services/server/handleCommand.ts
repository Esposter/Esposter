import type { Command } from "#src/models/command/Command";
import type { Driver } from "#src/models/driver/Driver";

import { CommandType } from "#src/models/command/CommandType";
import { exhaustiveGuard } from "@esposter/shared";
// A page command, run against the driver. An opening command resolves to the session it opened, which the page
// Selects; every other command's effect arrives as events, so it resolves to nothing.
export const handleCommand = async (driver: Driver, command: Command): Promise<string> => {
  switch (command.type) {
    case CommandType.CloseSession:
      driver.closeSession(command.sessionId);
      return "";
    case CommandType.CreateSession:
      return driver.createSession(command.cwd);
    case CommandType.Fork:
      return driver.forkSession(command.sessionId, command.messageUuid);
    case CommandType.Interrupt:
      await driver.interrupt(command.sessionId);
      return "";
    case CommandType.ListSessions:
      return "";
    case CommandType.PermissionVerdict:
      driver.resolvePermission(command.sessionId, command.requestId, command.behavior, command.message);
      return "";
    case CommandType.Prompt:
      driver.prompt(command.sessionId, command.text, command.attachments);
      return "";
    case CommandType.Resume:
      return driver.resumeSession(command.sessionId);
    case CommandType.ResumeAt:
      return driver.resumeAt(command.sessionId, command.messageUuid);
    case CommandType.RewindFiles:
      await driver.rewindFiles(command.sessionId, command.messageUuid);
      return "";
    case CommandType.SetModel:
      await driver.setModel(command.sessionId, command.model);
      return "";
    case CommandType.SetPermissionMode:
      await driver.setPermissionMode(command.sessionId, command.permissionMode);
      return "";
    case CommandType.SlashCommand:
      driver.runSlashCommand(command.sessionId, command.name, command.arguments);
      return "";
    default:
      return exhaustiveGuard(command);
  }
};
