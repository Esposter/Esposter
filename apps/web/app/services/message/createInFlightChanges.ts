import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { updateMessageCopy } from "#src/services/message/updateMessageCopy";
import { withFinalizerAsync } from "@esposter/shared";

type MessageUpdate = MessageEvents["updateMessage"][0][0];

interface OpenRead {
  deletedIds: Set<ClientMessage["id"]>;
  roomId: ClientMessage["roomId"];
  updates: MessageUpdate[];
}

// A read of a room's messages answers with the rows as they were when it ran, so a delete or an edit the room sends
// While it is in flight is recorded here and taken into the answer as it lands: a deleted message stays out, and an
// Edited one takes its edit through the copy it names. A store holds one of these and forwards its hooks to it
export const createInFlightChanges = () => {
  const openReads = new Set<OpenRead>();
  const recordDelete = ({ id, roomId }: Pick<ClientMessage, "id" | "roomId">) => {
    for (const openRead of openReads) if (openRead.roomId === roomId) openRead.deletedIds.add(id);
  };
  const recordUpdate = (update: MessageUpdate) => {
    for (const openRead of openReads) if (openRead.roomId === update.roomId) openRead.updates.push(update);
  };
  // The messages land inside the read's own window, so a change sent while the query was out is in what the caller
  // Receives. The answer is returned whole for the caller to read its other fields, and `messages` is the landed list
  const read = <TAnswer, TMessage extends Pick<ClientMessage, "id"> & Versioned>(
    roomId: ClientMessage["roomId"],
    query: () => Promise<TAnswer>,
    messagesOf: (answer: TAnswer) => TMessage[],
  ) => {
    const openRead: OpenRead = { deletedIds: new Set(), roomId, updates: [] };
    openReads.add(openRead);
    return withFinalizerAsync(
      async () => {
        const answer = await query();
        const messages = messagesOf(answer).filter(({ id }) => !openRead.deletedIds.has(id));
        for (const message of messages)
          for (const update of openRead.updates) if (update.id === message.id) updateMessageCopy(message, update);
        return { answer, messages };
      },
      () => {
        openReads.delete(openRead);
      },
    );
  };
  return { read, recordDelete, recordUpdate };
};
