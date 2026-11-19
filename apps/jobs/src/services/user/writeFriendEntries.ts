import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";

// The person's friend requests in both directions and their current friends. A removed request or friendship is a tombstone,
// So only the live rows are written.
// Each other party appears by user id and display name only. A request the person sent carries the time it was sent.
// A request they received is the sender's act, so it carries no time.
// A friendship is one row for the pair, made when the receiver accepted it, so it carries no time.
export const writeFriendEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const where = { deletedAt: { isNull: true }, OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] };
  const [requests, friendships] = await Promise.all([
    getDb().query.friendRequestsInSocial.findMany({
      columns: { createdAt: true, receiverId: true, senderId: true },
      where,
    }),
    getDb().query.friendsInSocial.findMany({ columns: { receiverId: true, senderId: true }, where }),
  ]);
  const sentRequests = requests.filter(({ senderId }) => senderId === userId);
  const receivedIds = requests.filter(({ receiverId }) => receiverId === userId).map(({ senderId }) => senderId);
  const friendIds = friendships.map(({ receiverId, senderId }) => (senderId === userId ? receiverId : senderId));
  const partyIds = [...new Set([...sentRequests.map(({ receiverId }) => receiverId), ...receivedIds, ...friendIds])];
  const parties =
    partyIds.length > 0
      ? await getDb().query.usersInAuth.findMany({ columns: { id: true, name: true }, where: { id: { in: partyIds } } })
      : [];
  await archive.addJsonEntry("friends.json", {
    friends: parties.filter(({ id }) => friendIds.includes(id)),
    received: parties.filter(({ id }) => receivedIds.includes(id)),
    sent: sentRequests.flatMap(({ createdAt, receiverId }) => {
      const party = parties.find(({ id }) => id === receiverId);
      return party ? [{ createdAt, id: party.id, name: party.name }] : [];
    }),
  });
};
