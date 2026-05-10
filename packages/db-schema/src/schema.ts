import { accounts } from "@/schema/accounts";
import { achievementNameEnum, achievements } from "@/schema/achievements";
import { appUsersInMessage } from "@/schema/appUsersInMessage";
import { bansInMessage } from "@/schema/bansInMessage";
import { blocks } from "@/schema/blocks";
import { friendRequests } from "@/schema/friendRequests";
import { friends } from "@/schema/friends";
import { invitesInMessage } from "@/schema/invitesInMessage";
import { likes } from "@/schema/likes";
import { posts } from "@/schema/posts";
import { pushSubscriptionsInMessage } from "@/schema/pushSubscriptionsInMessage";
import { rateLimiterFlexible } from "@/schema/rateLimiterFlexible";
import { roomCategoriesInMessage } from "@/schema/roomCategoriesInMessage";
import { roomFiltersInMessage } from "@/schema/roomFiltersInMessage";
import { roomRolesInMessage } from "@/schema/roomRolesInMessage";
import { roomsInMessage, roomTypeEnum } from "@/schema/roomsInMessage";
import { searchHistoriesInMessage } from "@/schema/searchHistoriesInMessage";
import { sessions } from "@/schema/sessions";
import { surveys } from "@/schema/surveys";
import { userAchievements } from "@/schema/userAchievements";
import { users } from "@/schema/users";
import { userStatusEnum, userStatusesInMessage } from "@/schema/userStatusesInMessage";
import { usersToRoomRolesInMessage } from "@/schema/usersToRoomRolesInMessage";
import { notificationTypeEnum, usersToRoomsInMessage } from "@/schema/usersToRoomsInMessage";
import { verifications } from "@/schema/verifications";
import { webhooksInMessage } from "@/schema/webhooksInMessage";

export const schema = {
  accounts,
  achievementNameEnum,
  achievements,
  appUsersInMessage,
  bansInMessage,
  blocks,
  friendRequests,
  friends,
  invitesInMessage,
  likes,
  notificationTypeEnum,
  posts,
  pushSubscriptionsInMessage,
  rateLimiterFlexible,
  roomCategoriesInMessage,
  roomFiltersInMessage,
  roomRolesInMessage,
  roomsInMessage,
  roomTypeEnum,
  searchHistoriesInMessage,
  sessions,
  surveys,
  userAchievements,
  users,
  userStatusEnum,
  userStatusesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  verifications,
  webhooksInMessage,
};
