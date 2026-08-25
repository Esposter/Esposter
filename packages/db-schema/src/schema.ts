import { accounts } from "#src/schema/accounts";
import { achievementNameEnum, achievements } from "#src/schema/achievements";
import { appUsersInMessage } from "#src/schema/appUsersInMessage";
import { bansInMessage } from "#src/schema/bansInMessage";
import { blocks } from "#src/schema/blocks";
import { callSessionsInMessage } from "#src/schema/callSessionsInMessage";
import { friendRequests } from "#src/schema/friendRequests";
import { friends } from "#src/schema/friends";
import { invitesInMessage } from "#src/schema/invitesInMessage";
import { likes } from "#src/schema/likes";
import { appNotificationTypeEnum, notifications, notificationSeverityEnum } from "#src/schema/notifications";
import { posts } from "#src/schema/posts";
import { pushSubscriptions } from "#src/schema/pushSubscriptions";
import { rateLimiterFlexible } from "#src/schema/rateLimiterFlexible";
import { resourceAccesses } from "#src/schema/resourceAccesses";
import { resourceFavorites } from "#src/schema/resourceFavorites";
import { resourcePublications } from "#src/schema/resourcePublications";
import { resources, resourceTypeEnum } from "#src/schema/resources";
import { roomCategoriesInMessage } from "#src/schema/roomCategoriesInMessage";
import { roomEmojisInMessage } from "#src/schema/roomEmojisInMessage";
import { roomFiltersInMessage, wordFilterActionEnum } from "#src/schema/roomFiltersInMessage";
import { roomRolesInMessage } from "#src/schema/roomRolesInMessage";
import { mimeCategoryEnum, roomsInMessage, roomTypeEnum } from "#src/schema/roomsInMessage";
import { scheduledMessageJobsInMessage } from "#src/schema/scheduledMessageJobsInMessage";
import { searchHistoriesInMessage } from "#src/schema/searchHistoriesInMessage";
import { sessions } from "#src/schema/sessions";
import { azureContainerEnum, storageLedger } from "#src/schema/storageLedger";
import { threadFollowsInMessage } from "#src/schema/threadFollowsInMessage";
import { userAchievements } from "#src/schema/userAchievements";
import { storageTierEnum, users } from "#src/schema/users";
import { noiseSuppressionModeEnum, userSettingsInMessage, voiceInputModeEnum } from "#src/schema/userSettingsInMessage";
import { userStatusEnum, userStatusesInMessage } from "#src/schema/userStatusesInMessage";
import { usersToRoomRolesInMessage } from "#src/schema/usersToRoomRolesInMessage";
import { notificationTypeEnum, usersToRoomsInMessage } from "#src/schema/usersToRoomsInMessage";
import { verifications } from "#src/schema/verifications";
import { webhooksInMessage } from "#src/schema/webhooksInMessage";

export const schema = {
  accounts,
  achievementNameEnum,
  achievements,
  appNotificationTypeEnum,
  appUsersInMessage,
  azureContainerEnum,
  bansInMessage,
  blocks,
  callSessionsInMessage,
  friendRequests,
  friends,
  invitesInMessage,
  likes,
  mimeCategoryEnum,
  noiseSuppressionModeEnum,
  notifications,
  notificationSeverityEnum,
  notificationTypeEnum,
  posts,
  pushSubscriptions,
  rateLimiterFlexible,
  resourceAccesses,
  resourceFavorites,
  resourcePublications,
  resources,
  resourceTypeEnum,
  roomCategoriesInMessage,
  roomEmojisInMessage,
  roomFiltersInMessage,
  roomRolesInMessage,
  roomsInMessage,
  roomTypeEnum,
  scheduledMessageJobsInMessage,
  searchHistoriesInMessage,
  sessions,
  storageLedger,
  storageTierEnum,
  threadFollowsInMessage,
  userAchievements,
  users,
  userSettingsInMessage,
  userStatusEnum,
  userStatusesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  verifications,
  voiceInputModeEnum,
  webhooksInMessage,
  wordFilterActionEnum,
};
