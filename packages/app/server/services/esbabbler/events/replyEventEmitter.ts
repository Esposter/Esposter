import type { MessageReplyMetadataEntity } from "#shared/models/db/message/metadata/MessageReplyMetadataEntity";

import { EventEmitter } from "node:events";

interface ReplyEvents {
  createReply: MessageReplyMetadataEntity[];
}

export const replyEventEmitter = new EventEmitter<ReplyEvents>();
