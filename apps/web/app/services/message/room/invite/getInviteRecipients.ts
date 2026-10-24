import type { InviteRecipient } from "@/models/message/room/invite/InviteRecipient";
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { getDirectMessageName } from "@/services/message/room/getDirectMessageName";
import { getFriendRecencyMap } from "@/services/message/room/invite/getFriendRecencyMap";

// The friends and group conversations the invite dialog lists in one order, the one talked to most recently leading. A
// Group's recency is its place in the direct message list, the same order a friend's is read in, and a friend with no
// Direct message keeps the friends list's order behind every one who has one
export const getInviteRecipients = (
  friends: PublicUser[],
  directMessages: RoomInMessage[],
  checkIsGroupDirectMessage: (directMessageId: string) => boolean,
  getDirectMessageParticipants: (directMessageId: string) => (PublicUser & { displayName?: string })[],
): InviteRecipient[] => {
  const friendRecencyMap = getFriendRecencyMap(directMessages, getDirectMessageParticipants);
  const friendRecipients = friends.map(({ id, image, name }) => ({
    id,
    image,
    isGroup: false,
    name,
    recency: friendRecencyMap.get(id) ?? Number.MAX_SAFE_INTEGER,
  }));
  const groupRecipients = directMessages.flatMap((directMessage, index) =>
    checkIsGroupDirectMessage(directMessage.id)
      ? [
          {
            id: directMessage.id,
            image: directMessage.image,
            isGroup: true,
            name: getDirectMessageName(directMessage, getDirectMessageParticipants(directMessage.id)),
            recency: index,
          },
        ]
      : [],
  );
  return [...friendRecipients, ...groupRecipients].toSorted(
    (firstRecipient, secondRecipient) => firstRecipient.recency - secondRecipient.recency,
  );
};
