import type { MessageReplyMetadataEntity } from "@/shared/models/esbabbler/message/metadata/reply";

import EventEmitter from "eventemitter3";

interface ReplyEvents {
  createReply: (data: MessageReplyMetadataEntity) => void;
}

export const replyEventEmitter = new EventEmitter<ReplyEvents>();
