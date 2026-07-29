import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { MessageEntity } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";
import type { Promisable } from "type-fest";

import { createHookRegistry } from "@/services/shared/createHookRegistry";
import { Operation } from "@esposter/shared";

export const MessageHookMap = {
  // Runs once the server has accepted the send, for the composer state a rejection must be able to hand back.
  // Separate from `ResetSend` because the two answer different questions: the bubble is the sender's copy of the
  // Text the moment it exists, so the editor clears then — but it is not a copy of an attachment. An attachment
  // Leaves the composer with the only grant that authorizes reclaiming its blob, so releasing it before the
  // Server accepts strands the blob for good on every rejected send, and takes the user's retry with it.
  // Carries the ids the accepted message actually persisted, never "whatever the composer holds now": the
  // Commit runs behind the send, and an attachment the user added while it was in flight belongs to their next
  // Message — released here, it leaves the composer with no grant left to reclaim its blob
  CommitSend: createHookRegistry<(roomId: string, fileIds: string[]) => Promisable<void>>(),
  [Operation.Create]: createHookRegistry<(message: MessageEntity) => Promisable<void>>(),
  [Operation.Delete]: createHookRegistry<(input: DeleteMessageInput) => Promisable<void>>(),
  [Operation.Update]: createHookRegistry<(input: MessageEvents["updateMessage"][number]) => Promisable<void>>(),
  // Carries the room it is resetting: the reset runs behind the optimistic bubble, so an await separates it from
  // The send and `currentRoomId` may already name the room the user switched to while it was in flight
  ResetSend: createHookRegistry<(roomId: string, editor?: Editor) => Promisable<void>>(),
};
