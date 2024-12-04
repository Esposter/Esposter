import type { MessageReplyMetadataEntity } from "#shared/models/db/message/metadata/MessageReplyMetadataEntity";

import EventEmitter from "eventemitter3";

interface ReplyEvents {
  createReply: (data: MessageReplyMetadataEntity) => void;
}

export const replyEventEmitter = new EventEmitter<ReplyEvents>();
