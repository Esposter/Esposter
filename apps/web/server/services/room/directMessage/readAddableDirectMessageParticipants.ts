import type { Context } from "#server/trpc/context";
import type { PublicUser } from "@esposter/db-schema";

import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { inJsonArray } from "@esposter/db";
import {
  blocksInSocial,
  DatabaseEntityType,
  DerivedDatabaseEntityType,
  friendsInSocial,
  getPublicUserColumns,
  usersInAuth,
} from "@esposter/db-schema";
import { getOrCreate, Operation } from "@esposter/shared";
import { and, eq, or } from "drizzle-orm";

// The users a direct message adds, in the order they are named. Each is refused when already a participant, when not a
// Friend of the actor, or when a block joins them to a participant, counting the users admitted before them in the same
// Request. The users, friendships and blocks are each one set read, so a request costs the same number of reads however
// Many users it names, and the checks run in memory in the order that decides which refusal a user gets
export const readAddableDirectMessageParticipants = async (
  db: Context["db"],
  actorUserId: string,
  participantIds: string[],
  userIds: string[],
): Promise<PublicUser[]> => {
  const participantAndUserIds = [...participantIds, ...userIds];
  const [users, friendships, blocks] = await Promise.all([
    db.select(getPublicUserColumns(usersInAuth)).from(usersInAuth).where(inJsonArray(usersInAuth.id, userIds)),
    db
      .select()
      .from(friendsInSocial)
      .where(
        or(
          and(eq(friendsInSocial.senderId, actorUserId), inJsonArray(friendsInSocial.receiverId, userIds)),
          and(eq(friendsInSocial.receiverId, actorUserId), inJsonArray(friendsInSocial.senderId, userIds)),
        ),
      ),
    db
      .select()
      .from(blocksInSocial)
      .where(
        or(
          and(
            inJsonArray(blocksInSocial.blockedId, userIds),
            inJsonArray(blocksInSocial.blockerId, participantAndUserIds),
          ),
          and(
            inJsonArray(blocksInSocial.blockerId, userIds),
            inJsonArray(blocksInSocial.blockedId, participantAndUserIds),
          ),
        ),
      ),
  ]);
  const userMap = new Map(users.map((user) => [user.id, user]));
  const friendIds = new Set(
    friendships.map(({ receiverId, senderId }) => (senderId === actorUserId ? receiverId : senderId)),
  );
  // Each user's blocks in either direction, so a check asks whether any user it would join is in that set
  const userIdBlockedIdsMap = new Map<string, Set<string>>();
  for (const { blockedId, blockerId } of blocks) {
    getOrCreate(userIdBlockedIdsMap, blockerId, () => new Set()).add(blockedId);
    getOrCreate(userIdBlockedIdsMap, blockedId, () => new Set()).add(blockerId);
  }

  const admittedIds = [...participantIds];
  const addedUsers: PublicUser[] = [];
  for (const userId of userIds) {
    const blockedIds = userIdBlockedIdsMap.get(userId);
    const user = userMap.get(userId);
    if (admittedIds.includes(userId))
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, userId);
    else if (!friendIds.has(userId))
      throw getInvalidOperationError(Operation.Create, DerivedDatabaseEntityType.DirectMessage, userId);
    else if (admittedIds.some((admittedId) => blockedIds?.has(admittedId)))
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, userId);
    else if (user) {
      admittedIds.push(userId);
      addedUsers.push(user);
    } else throw getNotFoundError(DatabaseEntityType.User, userId);
  }
  return addedUsers;
};
