import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";
import { getLiveRowWhere } from "@esposter/db-schema";

// The person's memberships in rooms they do not own, each with the person's own settings there.
// Each also carries the time they joined, the time they last read the room, the category they filed it under, and the
// Roles they hold in it.
// The other members of a room are not listed.
// The mention count is derived from other people's messages, and the slowmode and timeout clocks are operational.
// So none of them is written
export const writeMembershipEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const rooms = await getDb().query.roomsInMessage.findMany({
    columns: { id: true },
    where: { userId: { eq: userId } },
  });
  const ownedRoomIds = new Set(rooms.map(({ id }) => id));
  const memberships = (
    await getDb().query.usersToRoomsInMessage.findMany({
      columns: {
        categoryId: true,
        createdAt: true,
        displayName: true,
        isHidden: true,
        lastReadAt: true,
        notificationType: true,
        roomId: true,
      },
      where: { RAW: getLiveRowWhere, userId: { eq: userId } },
    })
  ).filter(({ roomId }) => !ownedRoomIds.has(roomId));
  const memberRoles = await getDb().query.usersToRoomRolesInMessage.findMany({
    columns: { roleId: true },
    where: { RAW: getLiveRowWhere, userId: { eq: userId } },
  });
  const roleIds = memberRoles.map(({ roleId }) => roleId);
  const roomRoles =
    roleIds.length > 0
      ? await getDb().query.roomRolesInMessage.findMany({
          columns: { id: true, name: true, roomId: true },
          where: { id: { in: roleIds }, RAW: getLiveRowWhere },
        })
      : [];
  await archive.addJsonEntry(
    "memberships.json",
    memberships.map(({ roomId, ...membership }) => ({
      ...membership,
      roles: roomRoles.filter((role) => role.roomId === roomId).map(({ id, name }) => ({ id, name })),
      roomId,
    })),
  );
};
