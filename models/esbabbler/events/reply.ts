import type { MessageReplyMetadataEntity } from "@/models/esbabbler/message/reply";
import EventEmitter from "eventemitter3";

interface ReplyEvents {
  onCreateReply: (data: MessageReplyMetadataEntity) => void;
}

export const replyEventEmitter = new EventEmitter<ReplyEvents>();
