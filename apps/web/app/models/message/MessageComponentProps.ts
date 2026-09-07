import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";

export interface MessageComponentProps<T extends MessageEntity = MessageEntity> {
  active?: boolean;
  creator: Creator;
  isPreview?: boolean;
  isSameBatch?: boolean;
  message: T;
}
