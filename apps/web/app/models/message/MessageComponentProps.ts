import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { Creator } from "#src/models/message/Creator";

export interface MessageComponentProps {
  active?: boolean;
  creator: Creator;
  isPreview?: boolean;
  isSameBatch?: boolean;
  message: ClientMessage;
}
