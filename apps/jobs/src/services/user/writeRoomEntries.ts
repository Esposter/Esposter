/* oxlint-disable no-await-in-loop -- Async iteration: the messages stream a page at a time, so one page and one attachment are held at once; Order is the contract: the archive takes one entry at a time, so each room's entries stay in order */
import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomMessage, UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getRoomObject } from "#src/services/room/getRoomObject";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { readPages } from "#src/services/shared/readPages";
import { readPagesToEnd } from "#src/services/shared/readPagesToEnd";
import { writeRoomFileEntries } from "#src/services/user/writeRoomFileEntries";

// The messages as one JSON array, encoded page by page as the archive reads them, so the array is never held whole
const encodeMessagesJson = async function* (pages: AsyncIterable<RoomMessage[]>): AsyncGenerator<Uint8Array> {
  const encoder = new TextEncoder();
  let separator = "";
  yield encoder.encode("[");
  for await (const page of pages)
    for (const message of page) {
      yield encoder.encode(`${separator}${JSON.stringify(message)}`);
      separator = ",";
    }
  yield encoder.encode("]");
};

// The rooms the person is a member of are written one at a time.
// Each is written as its messages.json, streamed from the room's object, and then the attachments those messages name.
// Membership is the only index from a person to a room, so a room they have left is not in the archive
export const writeRoomEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const roomIds = await getAccountMemberRoomIds(userId);
  for (const roomId of roomIds) {
    // The person's messages in the room, one page of the room's object at a time, oldest first
    const readMessagePage = (after: RoomMessage["id"] | undefined, limit: number) =>
      getRoomObject(roomId).exportUserMessages({ after, limit, userId });
    const messagePages = readPages(readMessagePage, ({ id }: RoomMessage) => id, OBJECT_READ_PAGE_LIMIT);
    await archive.addEntry(`rooms/${roomId}/messages.json`, encodeMessagesJson(messagePages));
    await readPagesToEnd(
      readMessagePage,
      ({ id }: RoomMessage) => id,
      OBJECT_READ_PAGE_LIMIT,
      (page) => writeRoomFileEntries(archive, roomId, page),
    );
  }
};
