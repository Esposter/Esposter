/* oxlint-disable no-await-in-loop -- Bounded concurrency: one room at a time, one page and one attachment held at once; The archive takes one entry at a time, so its entries stay in order */
import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomMessage, UserInAuth } from "@esposter/db-schema";

import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getRoomObject } from "#src/services/room/getRoomObject";
import { DATA_EXPORT_MESSAGE_PAGE_LIMIT } from "#src/services/user/constants";
import { writeRoomFileEntries } from "#src/services/user/writeRoomFileEntries";

// The person's messages in a room, one page of the room's object at a time, oldest first. The page's cursor is the last
// id it holds, so a page is never read twice and never skipped
const readRoomMessagePages = async function* (roomId: string, userId: string): AsyncGenerator<RoomMessage[]> {
  let after: number | undefined;
  let page: RoomMessage[];
  do {
    page = await getRoomObject(roomId).exportUserMessages({ after, limit: DATA_EXPORT_MESSAGE_PAGE_LIMIT, userId });
    yield page;
    after = page.at(-1)?.id;
  } while (page.length === DATA_EXPORT_MESSAGE_PAGE_LIMIT);
};

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
    await archive.addEntry(`rooms/${roomId}/messages.json`, encodeMessagesJson(readRoomMessagePages(roomId, userId)));
    for await (const page of readRoomMessagePages(roomId, userId)) await writeRoomFileEntries(archive, roomId, page);
  }
};
