import type { Attachment, PromptCommand, SlashCommandCommand } from "agent-console-server/contracts";
import type { DistributedOmit } from "type-fest";

import { toSlashCommand } from "@/services/agentConsole/toSlashCommand";
import { CommandType } from "agent-console-server/contracts";

// What the reader's prompt sends to a session: a slash command when the text starts with one, otherwise a message
export const toPromptCommand = (
  sessionId: string,
  text: string,
  attachments: Attachment[],
): DistributedOmit<PromptCommand | SlashCommandCommand, "id"> =>
  toSlashCommand(sessionId, text) ?? { attachments, sessionId, text, type: CommandType.Prompt };
