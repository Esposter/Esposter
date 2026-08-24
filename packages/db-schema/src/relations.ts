import { accountsRelation } from "#src/relations/accountsRelation";
import { achievementsRelation } from "#src/relations/achievementsRelation";
import { appUsersInMessageRelation } from "#src/relations/appUsersInMessageRelation";
import { bansInMessageRelation } from "#src/relations/bansInMessageRelation";
import { blocksRelation } from "#src/relations/blocksRelation";
import { callSessionsInMessageRelation } from "#src/relations/callSessionsInMessageRelation";
import { friendRequestsRelation } from "#src/relations/friendRequestsRelation";
import { friendsRelation } from "#src/relations/friendsRelation";
import { invitesInMessageRelation } from "#src/relations/invitesInMessageRelation";
import { likesRelation } from "#src/relations/likesRelation";
import { postsRelation } from "#src/relations/postsRelation";
import { pushSubscriptionsInMessageRelation } from "#src/relations/pushSubscriptionsInMessageRelation";
import { resourceAccessesRelation } from "#src/relations/resourceAccessesRelation";
import { resourceFavoritesRelation } from "#src/relations/resourceFavoritesRelation";
import { resourcePublicationsRelation } from "#src/relations/resourcePublicationsRelation";
import { resourcesRelation } from "#src/relations/resourcesRelation";
import { roomCategoriesInMessageRelation } from "#src/relations/roomCategoriesInMessageRelation";
import { roomEmojisInMessageRelation } from "#src/relations/roomEmojisInMessageRelation";
import { roomFiltersInMessageRelation } from "#src/relations/roomFiltersInMessageRelation";
import { roomRolesInMessageRelation } from "#src/relations/roomRolesInMessageRelation";
import { roomsInMessageRelation } from "#src/relations/roomsInMessageRelation";
import { scheduledMessageJobsInMessageRelation } from "#src/relations/scheduledMessageJobsInMessageRelation";
import { searchHistoriesInMessageRelation } from "#src/relations/searchHistoriesInMessageRelation";
import { sessionsRelation } from "#src/relations/sessionsRelation";
import { storageLedgerRelation } from "#src/relations/storageLedgerRelation";
import { threadFollowsInMessageRelation } from "#src/relations/threadFollowsInMessageRelation";
import { userAchievementsRelation } from "#src/relations/userAchievementsRelation";
import { usersRelation } from "#src/relations/usersRelation";
import { userStatusesInMessageRelation } from "#src/relations/userStatusesInMessageRelation";
import { usersToRoomRolesInMessageRelation } from "#src/relations/usersToRoomRolesInMessageRelation";
import { usersToRoomsInMessageRelation } from "#src/relations/usersToRoomsInMessageRelation";
import { webhooksInMessageRelation } from "#src/relations/webhooksInMessageRelation";

export const relations = {
  ...accountsRelation,
  ...callSessionsInMessageRelation,
  ...achievementsRelation,
  ...appUsersInMessageRelation,
  ...bansInMessageRelation,
  ...blocksRelation,
  ...friendRequestsRelation,
  ...friendsRelation,
  ...invitesInMessageRelation,
  ...likesRelation,
  ...postsRelation,
  ...pushSubscriptionsInMessageRelation,
  ...resourceAccessesRelation,
  ...resourceFavoritesRelation,
  ...resourcePublicationsRelation,
  ...resourcesRelation,
  ...roomCategoriesInMessageRelation,
  ...roomEmojisInMessageRelation,
  ...roomFiltersInMessageRelation,
  ...roomRolesInMessageRelation,
  ...roomsInMessageRelation,
  ...scheduledMessageJobsInMessageRelation,
  ...searchHistoriesInMessageRelation,
  ...sessionsRelation,
  ...storageLedgerRelation,
  ...threadFollowsInMessageRelation,
  ...userAchievementsRelation,
  ...userStatusesInMessageRelation,
  ...usersRelation,
  ...usersToRoomRolesInMessageRelation,
  ...usersToRoomsInMessageRelation,
  ...webhooksInMessageRelation,
};
