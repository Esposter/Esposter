import * as accounts from "@/schema/accounts";
import * as achievements from "@/schema/achievements";
import * as appUsersInMessage from "@/schema/appUsersInMessage";
import * as bansInMessage from "@/schema/bansInMessage";
import * as blocks from "@/schema/blocks";
import * as friendRequests from "@/schema/friendRequests";
import * as friends from "@/schema/friends";
import * as invitesInMessage from "@/schema/invitesInMessage";
import * as likes from "@/schema/likes";
import * as posts from "@/schema/posts";
import * as pushSubscriptionsInMessage from "@/schema/pushSubscriptionsInMessage";
import * as rateLimiterFlexible from "@/schema/rateLimiterFlexible";
import * as roomCategoriesInMessage from "@/schema/roomCategoriesInMessage";
import * as roomRolesInMessage from "@/schema/roomRolesInMessage";
import * as roomsInMessage from "@/schema/roomsInMessage";
import * as searchHistoriesInMessage from "@/schema/searchHistoriesInMessage";
import * as sessions from "@/schema/sessions";
import * as surveys from "@/schema/surveys";
import * as userAchievements from "@/schema/userAchievements";
import * as users from "@/schema/users";
import * as userStatusesInMessage from "@/schema/userStatusesInMessage";
import * as usersToRoomRolesInMessage from "@/schema/usersToRoomRolesInMessage";
import * as usersToRoomsInMessage from "@/schema/usersToRoomsInMessage";
import * as verifications from "@/schema/verifications";
import * as webhooksInMessage from "@/schema/webhooksInMessage";

export const schema = {
  ...accounts,
  ...achievements,
  ...appUsersInMessage,
  ...bansInMessage,
  ...blocks,
  ...friendRequests,
  ...friends,
  ...invitesInMessage,
  ...likes,
  ...posts,
  ...pushSubscriptionsInMessage,
  ...rateLimiterFlexible,
  ...roomCategoriesInMessage,
  ...roomRolesInMessage,
  ...roomsInMessage,
  ...searchHistoriesInMessage,
  ...sessions,
  ...surveys,
  ...userAchievements,
  ...users,
  ...userStatusesInMessage,
  ...usersToRoomRolesInMessage,
  ...usersToRoomsInMessage,
  ...verifications,
  ...webhooksInMessage,
};
