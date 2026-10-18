import type { Attachment } from "agent-console-server/contracts";

export interface SideChatQuestion {
  attachments: Attachment[];
  text: string;
}
