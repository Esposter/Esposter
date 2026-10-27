import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";

// The person's memberships in rooms they do not own, each with the person's own settings there, the time they joined
// And the time they last read the room, and the roles they hold in it. The other members of a room are not listed.
// The mention count is derived from other people's messages, and the slowmode and timeout clocks are operational, so
// None of them is written
export const writeMembershipEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const ownedRooms = await db.query.roomsInMessage.findMany({
    columns: { id: true },
    where: { userId: { eq: userId } },
  });
  const ownedRoomIds = new Set(ownedRooms.map(({ id }) => id));
  const memberships = (
    await db.query.usersToRoomsInMessage.findMany({
      columns: {
        createdAt: true,
        displayName: true,
        isHidden: true,
        lastReadAt: true,
        notificationType: true,
        roomId: true,
      },
      where: { userId: { eq: userId } },
    })
  ).filter(({ roomId }) => !ownedRoomIds.has(roomId));
  const roleRows = await db.query.usersToRoomRolesInMessage.findMany({
    columns: { roleId: true },
    where: { userId: { eq: userId } },
  });
  const roleIds = roleRows.map(({ roleId }) => roleId);
  const roles =
    roleIds.length > 0
      ? await db.query.roomRolesInMessage.findMany({
          columns: { id: true, name: true, roomId: true },
          where: { id: { in: roleIds } },
        })
      : [];
  await archive.addJsonEntry(
    "memberships.json",
    memberships.map(({ roomId, ...membership }) =>
      Object.assign(membership, {
        roles: roles.filter((role) => role.roomId === roomId).map(({ id, name }) => ({ id, name })),
        roomId,
      }),
    ),
  );
};
