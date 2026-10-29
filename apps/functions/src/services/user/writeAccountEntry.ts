import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The account.json entry: the user row, the sign-in providers by name and the push subscriptions by endpoint.
// Each is without its tokens or keys, beside the account's own block, notification, achievement and game-setting rows.
// Friends are in their own entry, where each other party is named.
// No row carries its update or delete time.
// A row carries its creation time only where it records the person's own act.
// Those are the account's creation, a block, a bookmark.
// A notification, an achievement, a setting and a status are written by the system or are the account's current state
export const writeAccountEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const [user, accounts, pushSubscriptions, blocks, notifications, achievements, bookmarks, settings, statuses] =
    await Promise.all([
      db.query.usersInAuth.findFirst({
        columns: {
          biography: true,
          createdAt: true,
          email: true,
          emailVerified: true,
          id: true,
          image: true,
          name: true,
          storageBytesUsed: true,
          storageTier: true,
        },
        where: { id: { eq: userId } },
      }),
      db.query.accountsInAuth.findMany({ columns: { providerId: true }, where: { userId: { eq: userId } } }),
      db.query.pushSubscriptionsInNotification.findMany({
        columns: { endpoint: true },
        where: { userId: { eq: userId } },
      }),
      db.query.blocksInSocial.findMany({
        columns: { deletedAt: false, updatedAt: false },
        where: { blockerId: { eq: userId } },
      }),
      db.query.notificationsInNotification.findMany({
        columns: { createdAt: false, deletedAt: false, updatedAt: false },
        where: { userId: { eq: userId } },
      }),
      db.query.userAchievementsInAchievement.findMany({
        columns: { createdAt: false, deletedAt: false, updatedAt: false },
        where: { userId: { eq: userId } },
      }),
      db.query.bookmarksInApp.findMany({
        columns: { deletedAt: false, updatedAt: false },
        where: { userId: { eq: userId } },
      }),
      db.query.userSettingsInMessage.findMany({
        columns: { createdAt: false, deletedAt: false, updatedAt: false },
        where: { userId: { eq: userId } },
      }),
      db.query.userStatusesInMessage.findMany({
        columns: { createdAt: false, deletedAt: false, updatedAt: false },
        where: { userId: { eq: userId } },
      }),
    ]);
  // The account row is what every other entry is keyed to, so an export of a missing account has nothing to say
  if (!user) throw new InvalidOperationError(Operation.Read, userId, "has no user row to export");

  await archive.addJsonEntry("account.json", {
    achievements,
    blocks,
    bookmarks,
    notifications,
    pushSubscriptions: pushSubscriptions.map(({ endpoint }) => endpoint),
    settings,
    signInProviders: accounts.map(({ providerId }) => providerId),
    statuses,
    user,
  });
};
