import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { MessageEntity } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";
import type { Promisable } from "type-fest";

import { createHookRegistry } from "@/services/shared/createHookRegistry";
import { Operation } from "@esposter/shared";

export const MessageHookMap = {
  // Runs once the server has accepted the send: the attachments `ResetSend` was holding are dropped for good.
  // Separate from `ResetSend` because an attachment cannot simply be discarded there — it leaves the composer
  // With the only grant that authorizes reclaiming its blob, so a rejected send has to be able to hand it back.
  // Carries the ids the accepted message actually persisted, never "whatever the composer holds now": the
  // Commit runs behind the send, and an attachment the user added while it was in flight belongs to their next
  // Message — released here, it leaves the composer with no grant left to reclaim its blob
  CommitSend: createHookRegistry<(roomId: string, fileIds: string[]) => Promisable<void>>(),
  [Operation.Create]: createHookRegistry<(message: MessageEntity) => Promisable<void>>(),
  [Operation.Delete]: createHookRegistry<(input: DeleteMessageInput) => Promisable<void>>(),
  [Operation.Update]: createHookRegistry<(input: MessageEvents["updateMessage"][number]) => Promisable<void>>(),
  // Runs once the optimistic bubble is in the list: the editor and the reply target clear, and the attachments
  // This send took leave the composer. They leave here rather than at the commit because the composer keeps
  // Accepting Enter for the whole round trip, and one that still offers them posts a second message naming the
  // Same blobs — deleting either message then reclaims blobs the other still renders. They are held, not
  // Discarded: `CommitSend` drops them and `RollbackSend` hands them back.
  // Carries the room it is resetting: the reset runs behind the optimistic bubble, so an await separates it from
  // The send and `currentRoomId` may already name the room the user switched to while it was in flight
  ResetSend: createHookRegistry<(roomId: string, fileIds: string[], editor?: Editor) => Promisable<void>>(),
  // The composer's attachments were handed back — a send the server rejected. They never left the store, so
  // Their grants are intact and the user retries with the files already uploaded instead of re-picking them
  RollbackSend: createHookRegistry<(roomId: string, fileIds: string[]) => Promisable<void>>(),
};
