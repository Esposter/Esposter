import { db } from "#src/services/shared/db";

// Who a message notification is shown as. Resolved here rather than by each publisher, so the per-room display name
// ([display names](openspec/specs/esbabbler/display-names/design.md)) is applied once and never on the request path a member is waiting on.
//
// A webhook message has no author of its own — it is posted by an app user on the webhook's behalf — so the two
// Author kinds resolve to one display and everything downstream stops caring which it was.
export const getMessageNotificationAuthor = async ({
  appUserId,
  roomId,
  userId,
}: {
  appUserId?: string | undefined;
  roomId: string;
  userId?: string | undefined;
}): Promise<{ icon?: null | string | undefined; title: string }> => {
  if (userId) {
    const userToRoom = await db.query.usersToRoomsInMessage.findFirst({
      columns: { displayName: true },
      where: { roomId: { eq: roomId }, userId: { eq: userId } },
      with: { user: { columns: { image: true, name: true } } },
    });
    if (userToRoom) return { icon: userToRoom.user.image, title: userToRoom.displayName || userToRoom.user.name };
    else return { title: "" };
  } else if (appUserId) {
    // The bot's name is its webhook's, so a rename shows on the bot's messages that were posted before it
    const webhook = await db.query.webhooksInMessage.findFirst({
      columns: { name: true },
      where: { userId: { eq: appUserId } },
      with: { appUser: { columns: { image: true } } },
    });
    return { icon: webhook?.appUser.image, title: webhook?.name ?? "" };
  } else return { title: "" };
};
