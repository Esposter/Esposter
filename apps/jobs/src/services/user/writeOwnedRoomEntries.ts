/* oxlint-disable no-await-in-loop -- Order is the contract: the archive takes one entry at a time, so each room's record, images and emoji blobs are written in order, with its emoji read beside its record */
import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { writeRoomEmojiEntries } from "#src/services/user/writeRoomEmojiEntries";
import { writeRoomImageEntries } from "#src/services/user/writeRoomImageEntries";

// Each room the person owns is written as its record: its name, topic, type, settings and creation time.
// Its emoji are listed by id and name.
// The room's members are not written, since membership is other people's record.
// Its images and emoji blobs follow it.
export const writeOwnedRoomEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const rooms = await db.query.roomsInMessage.findMany({
    columns: {
      allowedMimeCategories: true,
      createdAt: true,
      id: true,
      isInvitePaused: true,
      isReadOnly: true,
      maxFileSizeBytes: true,
      name: true,
      slowmodeMs: true,
      topic: true,
      type: true,
    },
    where: { userId: { eq: userId } },
  });
  for (const room of rooms) {
    const emoji = await db.query.roomEmojisInMessage.findMany({
      columns: { id: true, name: true },
      where: { roomId: { eq: room.id } },
    });
    await archive.addJsonEntry(`rooms/${room.id}/room.json`, {
      createdAt: room.createdAt,
      emoji,
      id: room.id,
      name: room.name,
      settings: {
        allowedMimeCategories: room.allowedMimeCategories,
        isInvitePaused: room.isInvitePaused,
        isReadOnly: room.isReadOnly,
        maxFileSizeBytes: room.maxFileSizeBytes,
        slowmodeMs: room.slowmodeMs,
      },
      topic: room.topic,
      type: room.type,
    });
    await writeRoomImageEntries(archive, room.id);
    await writeRoomEmojiEntries(archive, room.id, emoji);
  }
};
