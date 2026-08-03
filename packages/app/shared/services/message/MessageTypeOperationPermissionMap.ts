import { MessageOperation } from "#shared/models/message/MessageOperation";
import { MessageOperationPermission } from "#shared/models/message/MessageOperationPermission";
import { MessageType } from "@esposter/db-schema";

// The one source of truth for two questions the client and the server must answer identically.
//
// Presence answers whether the operation exists for this message type at all. That is a property of the type
// Alone, so an operation missing here is refused for every caller — a member holding
// RoomPermission.ManageMessages still cannot edit a poll, because a poll has no editable body for anyone.
//
// The value answers which of the callers who could perform it actually may. Keeping the two questions apart is
// What lets a poll carry a vote operation without widening its edit operation to non-authors.
//
// Poll delete and pin resolve to Author because a poll is a message its author posted: the rule that lets them
// Delete or pin their own text message applies to their own poll unchanged, which is what the options menu
// Already offers. Webhook operations never resolve to Author — a webhook message has no user author
// (WebhookMessageEntity declares `userId?: undefined`), so an authorship rule there could only ever fall through
// To RoomPermission.ManageMessages. Call, EditRoom, PinMessage and System messages are written by the server on
// The room's behalf and support no operation at all.
export const MessageTypeOperationPermissionMap = {
  [MessageType.Call]: {},
  [MessageType.EditRoom]: {},
  [MessageType.Message]: {
    [MessageOperation.Delete]: MessageOperationPermission.Author,
    [MessageOperation.Pin]: MessageOperationPermission.Author,
    [MessageOperation.Update]: MessageOperationPermission.Author,
  },
  [MessageType.PinMessage]: {},
  [MessageType.Poll]: {
    [MessageOperation.Delete]: MessageOperationPermission.Author,
    [MessageOperation.Pin]: MessageOperationPermission.Author,
    [MessageOperation.Vote]: MessageOperationPermission.AnyMember,
  },
  [MessageType.System]: {},
  [MessageType.Webhook]: {
    [MessageOperation.Delete]: MessageOperationPermission.ManageMessages,
    [MessageOperation.Pin]: MessageOperationPermission.ManageMessages,
    [MessageOperation.Update]: MessageOperationPermission.ManageMessages,
  },
} as const satisfies Record<MessageType, Partial<Record<MessageOperation, MessageOperationPermission>>>;
