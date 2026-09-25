import { MessageActionType } from "@/models/agentConsole/MessageActionType";
import { CommandType } from "agent-console-server/contracts";

// A message action as the command the host runs for it; copying is the one action the page answers itself
export const MessageActionCommandTypeMap = {
  [MessageActionType.Fork]: CommandType.Fork,
  [MessageActionType.Rewind]: CommandType.ResumeAt,
  [MessageActionType.RewindFiles]: CommandType.RewindFiles,
} as const satisfies Record<Exclude<MessageActionType, MessageActionType.Copy>, CommandType>;
