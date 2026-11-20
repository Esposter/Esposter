import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";
import type { Page, RoomInMessage } from "@esposter/db-schema";

import { useReadMyUsersToRooms } from "#src/composables/message/room/useReadMyUsersToRooms";
import { useDirectMessageStore } from "#src/store/message/room/directMessage";

export const useReadDirectMessages = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const { arriveDirectMessageParticipants, arriveDirectMessages, readItems, readMoreItems } = directMessageStore;
  const readMyUsersToRooms = useReadMyUsersToRooms();
  // A page's rows and their participants arrive as the overlay's rows, and the page keeps only the ids its cursor pages by.
  // The viewer's own membership of each row is read too, since a list shows a conversation only while that membership is held
  const readDirectMessagePage = async (
    readPage: () => Promise<Page<RoomInMessage> & { participants: DirectMessageParticipants[] }>,
  ) => {
    const { participants, ...page } = await readPage();
    arriveDirectMessages(page.items);
    arriveDirectMessageParticipants(participants);
    await readMyUsersToRooms(page.items.map(({ id }) => id));
    return { ...page, items: page.items.map(({ id }) => ({ id })) };
  };
  const readDirectMessages = () =>
    readItems(() => readDirectMessagePage(() => $trpc.room.directMessage.readDirectMessages.query()));
  const readMoreDirectMessages = (onComplete: () => void) =>
    readMoreItems(
      (cursor) => readDirectMessagePage(() => $trpc.room.directMessage.readDirectMessages.query({ cursor })),
      onComplete,
    );

  return { readDirectMessages, readMoreDirectMessages };
};
