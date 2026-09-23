import type { SlashCommandCommand } from "agent-console-server/contracts";
import type { DistributedOmit } from "type-fest";

import { CommandType } from "agent-console-server/contracts";
// A prompt the way the terminal reads its input line: a leading slash runs the command it names with the rest as its
// Arguments, and anything else is a message
export const toSlashCommand = (
  sessionId: string,
  text: string,
): DistributedOmit<SlashCommandCommand, "id"> | undefined => {
  if (!text.startsWith("/")) return undefined;
  const [name = "", ...commandArguments] = text.slice(1).split(" ");
  return name
    ? { arguments: commandArguments.join(" ").trim(), name, sessionId, type: CommandType.SlashCommand }
    : undefined;
};
