import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

// Each friend is keyed to the place of the newest direct message they are in, read from the direct message list's own
// Order, so the first one a friend appears in is the newest
export const getFriendRecencyMap = (
  directMessages: Pick<RoomInMessage, "id">[],
  getDirectMessageParticipants: (directMessageId: string) => Pick<PublicUser, "id">[],
) => {
  const recencyMap = new Map<PublicUser["id"], number>();
  for (const [index, { id: directMessageId }] of directMessages.entries())
    for (const { id: participantId } of getDirectMessageParticipants(directMessageId))
      if (!recencyMap.has(participantId)) recencyMap.set(participantId, index);
  return recencyMap;
};
