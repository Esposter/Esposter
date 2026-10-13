import type { ListFilesCommand } from "#src/models/command/ListFilesCommand";
import type { ReadFileCommand } from "#src/models/command/ReadFileCommand";
import type { Driver } from "#src/models/driver/Driver";
import type { ServerMessage } from "#src/models/server/ServerMessage";

import { CommandType } from "#src/models/command/CommandType";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { getSessionCwd } from "#src/services/files/getSessionCwd";
import { listRepositoryFiles } from "#src/services/files/listRepositoryFiles";
import { readRepositoryFile } from "#src/services/files/readRepositoryFile";
import { exhaustiveGuard } from "@esposter/shared";

// A page's file command, answered by the host from the session's working directory. Both are confined to it, so a
// Path that leaves it fails rather than being read
export const handleFileCommand = async (
  driver: Driver,
  command: ListFilesCommand | ReadFileCommand,
): Promise<ServerMessage> => {
  const cwd = await getSessionCwd(driver, command.sessionId);
  switch (command.type) {
    case CommandType.ListFiles:
      return { commandId: command.id, files: await listRepositoryFiles(cwd), type: ServerMessageType.Files };
    case CommandType.ReadFile: {
      const file = await readRepositoryFile(cwd, command.path);
      return {
        commandId: command.id,
        content: file.content,
        notice: file.notice,
        path: command.path,
        type: ServerMessageType.FileContent,
      };
    }
    default:
      return exhaustiveGuard(command);
  }
};
