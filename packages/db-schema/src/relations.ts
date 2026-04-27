import { accountsRelation } from "@/relations/accountsRelation";
import { achievementsRelation } from "@/relations/achievementsRelation";
import { appUsersInMessageRelation } from "@/relations/appUsersInMessageRelation";
import { bansInMessageRelation } from "@/relations/bansInMessageRelation";
import { blocksRelation } from "@/relations/blocksRelation";
import { friendRequestsRelation } from "@/relations/friendRequestsRelation";
import { friendsRelation } from "@/relations/friendsRelation";
import { invitesInMessageRelation } from "@/relations/invitesInMessageRelation";
import { likesRelation } from "@/relations/likesRelation";
import { postsRelation } from "@/relations/postsRelation";
import { pushSubscriptionsInMessageRelation } from "@/relations/pushSubscriptionsInMessageRelation";
import { roomCategoriesInMessageRelation } from "@/relations/roomCategoriesInMessageRelation";
import { roomRolesInMessageRelation } from "@/relations/roomRolesInMessageRelation";
import { roomsInMessageRelation } from "@/relations/roomsInMessageRelation";
import { searchHistoriesInMessageRelation } from "@/relations/searchHistoriesInMessageRelation";
import { sessionsRelation } from "@/relations/sessionsRelation";
import { surveysRelation } from "@/relations/surveysRelation";
import { userAchievementsRelation } from "@/relations/userAchievementsRelation";
import { usersRelation } from "@/relations/usersRelation";
import { userStatusesInMessageRelation } from "@/relations/userStatusesInMessageRelation";
import { usersToRoomRolesInMessageRelation } from "@/relations/usersToRoomRolesInMessageRelation";
import { usersToRoomsInMessageRelation } from "@/relations/usersToRoomsInMessageRelation";
import { webhooksInMessageRelation } from "@/relations/webhooksInMessageRelation";

export const relations = {
  ...accountsRelation,
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
  ...roomCategoriesInMessageRelation,
  ...roomRolesInMessageRelation,
  ...roomsInMessageRelation,
  ...searchHistoriesInMessageRelation,
  ...sessionsRelation,
  ...surveysRelation,
  ...userAchievementsRelation,
  ...userStatusesInMessageRelation,
  ...usersRelation,
  ...usersToRoomRolesInMessageRelation,
  ...usersToRoomsInMessageRelation,
  ...webhooksInMessageRelation,
};
