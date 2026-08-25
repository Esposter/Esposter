import { db } from "#src/services/db";

// Who a message notification is shown as. Resolved here rather than by each publisher, so the per-room nickname
// ([nicknames](/docs/esbabbler/nicknames)) is applied once and never on the request path a member is waiting on.
//
// A webhook message has no author of its own — it is posted by an app user on the webhook's behalf — so the two
// Author kinds resolve to one display and everything downstream stops caring which it was.
export const getMessageNotificationAuthor = async ({
  appUserId,
  roomId,
  userId,
}: {
  appUserId?: string;
  roomId: string;
  userId?: string;
}): Promise<{ icon?: null | string; title: string }> => {
  if (userId) {
    const userToRoom = await db.query.usersToRoomsInMessage.findFirst({
      columns: { nickname: true },
      where: { roomId: { eq: roomId }, userId: { eq: userId } },
      with: { user: { columns: { image: true, name: true } } },
    });
    if (!userToRoom) return { title: "" };
    return { icon: userToRoom.user.image, title: userToRoom.nickname || userToRoom.user.name };
  }

  if (!appUserId) return { title: "" };

  const appUser = await db.query.appUsersInMessage.findFirst({
    columns: { image: true, name: true },
    where: { id: { eq: appUserId } },
  });
  return { icon: appUser?.image, title: appUser?.name ?? "" };
};
