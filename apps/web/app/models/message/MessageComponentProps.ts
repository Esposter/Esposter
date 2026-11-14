import type { ClientMessage } from "@/models/message/ClientMessage";
import type { Creator } from "@/models/message/Creator";

export interface MessageComponentProps {
  active?: boolean;
  creator: Creator;
  isPreview?: boolean;
  isSameBatch?: boolean;
  message: ClientMessage;
}
