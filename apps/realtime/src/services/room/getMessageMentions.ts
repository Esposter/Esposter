import { getMentionIds } from "@esposter/db";
import { MessageType } from "@esposter/db-schema";

// The members a message names, read from its text, so a live send, a forward, a scheduled send and an edit all name the
// Same members. A poll's body is its own JSON, and a webhook names nobody
export const getMessageMentions = (message: string, type: MessageType): string[] =>
  type === MessageType.Message ? getMentionIds(message) : [];
