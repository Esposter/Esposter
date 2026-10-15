import { FilterTypeAuthorType } from "#src/models/message/filter/FilterTypeAuthorType";
import { MessageType } from "#src/models/message/MessageType";

export const MessageTypeAuthorTypeMap = {
  [MessageType.Call]: FilterTypeAuthorType.User,
  [MessageType.EditRoom]: FilterTypeAuthorType.User,
  [MessageType.Message]: FilterTypeAuthorType.User,
  [MessageType.PinMessage]: FilterTypeAuthorType.User,
  [MessageType.Poll]: FilterTypeAuthorType.User,
  [MessageType.System]: FilterTypeAuthorType.User,
  [MessageType.Webhook]: FilterTypeAuthorType.Webhook,
} as const satisfies Record<MessageType, FilterTypeAuthorType>;
