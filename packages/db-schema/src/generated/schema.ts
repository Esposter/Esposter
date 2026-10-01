import { achievementSchema } from "#src/schema/achievement/achievementSchema";
import { achievementNameEnum, achievementsInAchievement } from "#src/schema/achievement/achievementsInAchievement";
import { userAchievementsInAchievement } from "#src/schema/achievement/userAchievementsInAchievement";
import { appSchema } from "#src/schema/app/appSchema";
import { bookmarksInApp } from "#src/schema/app/bookmarksInApp";
import { rateLimiterFlexibleInApp } from "#src/schema/app/rateLimiterFlexibleInApp";
import { accountsInAuth } from "#src/schema/auth/accountsInAuth";
import { apiKeysInAuth } from "#src/schema/auth/apiKeysInAuth";
import { authSchema } from "#src/schema/auth/authSchema";
import { sessionsInAuth } from "#src/schema/auth/sessionsInAuth";
import { storageTierEnum, usersInAuth } from "#src/schema/auth/usersInAuth";
import { verificationsInAuth } from "#src/schema/auth/verificationsInAuth";
import { appUsersInMessage } from "#src/schema/message/appUsersInMessage";
import { bansInMessage } from "#src/schema/message/bansInMessage";
import { callSessionsInMessage } from "#src/schema/message/callSessionsInMessage";
import { invitesInMessage } from "#src/schema/message/invitesInMessage";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomCategoriesInMessage } from "#src/schema/message/roomCategoriesInMessage";
import { roomEmojisInMessage } from "#src/schema/message/roomEmojisInMessage";
import { roomFiltersInMessage, wordFilterActionEnum } from "#src/schema/message/roomFiltersInMessage";
import { roomRolesInMessage } from "#src/schema/message/roomRolesInMessage";
import { mimeCategoryEnum, roomsInMessage, roomTypeEnum } from "#src/schema/message/roomsInMessage";
import { scheduledMessageJobsInMessage } from "#src/schema/message/scheduledMessageJobsInMessage";
import { searchHistoriesInMessage } from "#src/schema/message/searchHistoriesInMessage";
import { threadFollowsInMessage } from "#src/schema/message/threadFollowsInMessage";
import { noiseSuppressionModeEnum, userSettingsInMessage, voiceInputModeEnum } from "#src/schema/message/userSettingsInMessage";
import { userStatusEnum, userStatusesInMessage } from "#src/schema/message/userStatusesInMessage";
import { usersToRoomRolesInMessage } from "#src/schema/message/usersToRoomRolesInMessage";
import { notificationTypeEnum, usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { webhooksInMessage } from "#src/schema/message/webhooksInMessage";
import { notificationSchema } from "#src/schema/notification/notificationSchema";
import { appNotificationTypeEnum, notificationSeverityEnum, notificationsInNotification } from "#src/schema/notification/notificationsInNotification";
import { pushSubscriptionsInNotification } from "#src/schema/notification/pushSubscriptionsInNotification";
import { likesInPost } from "#src/schema/post/likesInPost";
import { postSchema } from "#src/schema/post/postSchema";
import { postsInPost } from "#src/schema/post/postsInPost";
import { resourceAccessesInResource } from "#src/schema/resource/resourceAccessesInResource";
import { resourceFavoritesInResource } from "#src/schema/resource/resourceFavoritesInResource";
import { resourcePublicationsInResource } from "#src/schema/resource/resourcePublicationsInResource";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource, resourceTypeEnum } from "#src/schema/resource/resourcesInResource";
import { resourceVersionsInResource, snapshotChannelEnum, snapshotReasonEnum } from "#src/schema/resource/resourceVersionsInResource";
import { blocksInSocial } from "#src/schema/social/blocksInSocial";
import { friendRequestsInSocial } from "#src/schema/social/friendRequestsInSocial";
import { friendsInSocial } from "#src/schema/social/friendsInSocial";
import { socialSchema } from "#src/schema/social/socialSchema";
import { azureContainerEnum, storageLedgerInStorage } from "#src/schema/storage/storageLedgerInStorage";
import { storageSchema } from "#src/schema/storage/storageSchema";

export const schema = {
  accountsInAuth,
  achievementNameEnum,
  achievementSchema,
  achievementsInAchievement,
  apiKeysInAuth,
  appNotificationTypeEnum,
  appSchema,
  appUsersInMessage,
  authSchema,
  azureContainerEnum,
  bansInMessage,
  blocksInSocial,
  bookmarksInApp,
  callSessionsInMessage,
  friendRequestsInSocial,
  friendsInSocial,
  invitesInMessage,
  likesInPost,
  messageSchema,
  mimeCategoryEnum,
  noiseSuppressionModeEnum,
  notificationSchema,
  notificationSeverityEnum,
  notificationsInNotification,
  notificationTypeEnum,
  postSchema,
  postsInPost,
  pushSubscriptionsInNotification,
  rateLimiterFlexibleInApp,
  resourceAccessesInResource,
  resourceFavoritesInResource,
  resourcePublicationsInResource,
  resourceSchema,
  resourcesInResource,
  resourceTypeEnum,
  resourceVersionsInResource,
  roomCategoriesInMessage,
  roomEmojisInMessage,
  roomFiltersInMessage,
  roomRolesInMessage,
  roomsInMessage,
  roomTypeEnum,
  scheduledMessageJobsInMessage,
  searchHistoriesInMessage,
  sessionsInAuth,
  snapshotChannelEnum,
  snapshotReasonEnum,
  socialSchema,
  storageLedgerInStorage,
  storageSchema,
  storageTierEnum,
  threadFollowsInMessage,
  userAchievementsInAchievement,
  userSettingsInMessage,
  usersInAuth,
  userStatusEnum,
  userStatusesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  verificationsInAuth,
  voiceInputModeEnum,
  webhooksInMessage,
  wordFilterActionEnum,
};
