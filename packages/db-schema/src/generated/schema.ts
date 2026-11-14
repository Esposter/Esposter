import { achievementsInAchievement } from "#src/schema/achievement/achievementsInAchievement";
import { userAchievementsInAchievement } from "#src/schema/achievement/userAchievementsInAchievement";
import { bookmarksInApp } from "#src/schema/app/bookmarksInApp";
import { rateLimiterFlexibleInApp } from "#src/schema/app/rateLimiterFlexibleInApp";
import { accountsInAuth } from "#src/schema/auth/accountsInAuth";
import { apiKeysInAuth } from "#src/schema/auth/apiKeysInAuth";
import { sessionsInAuth } from "#src/schema/auth/sessionsInAuth";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { verificationsInAuth } from "#src/schema/auth/verificationsInAuth";
import { appUsersInMessage } from "#src/schema/message/appUsersInMessage";
import { bansInMessage } from "#src/schema/message/bansInMessage";
import { callSessionsInMessage } from "#src/schema/message/callSessionsInMessage";
import { invitesInMessage } from "#src/schema/message/invitesInMessage";
import { messageEmojisInMessage } from "#src/schema/message/messageEmojisInMessage";
import { messagesInMessage } from "#src/schema/message/messagesInMessage";
import { moderationLogsInMessage } from "#src/schema/message/moderationLogsInMessage";
import { moderationNotesInMessage } from "#src/schema/message/moderationNotesInMessage";
import { roomCategoriesInMessage } from "#src/schema/message/roomCategoriesInMessage";
import { roomEmojisInMessage } from "#src/schema/message/roomEmojisInMessage";
import { roomFiltersInMessage } from "#src/schema/message/roomFiltersInMessage";
import { roomMemberPermissionsInMessage } from "#src/schema/message/roomMemberPermissionsInMessage";
import { roomRolesInMessage } from "#src/schema/message/roomRolesInMessage";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { searchHistoriesInMessage } from "#src/schema/message/searchHistoriesInMessage";
import { threadFollowsInMessage } from "#src/schema/message/threadFollowsInMessage";
import { userSettingsInMessage } from "#src/schema/message/userSettingsInMessage";
import { userStatusesInMessage } from "#src/schema/message/userStatusesInMessage";
import { usersToRoomRolesInMessage } from "#src/schema/message/usersToRoomRolesInMessage";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { webhooksInMessage } from "#src/schema/message/webhooksInMessage";
import { notificationsInNotification } from "#src/schema/notification/notificationsInNotification";
import { pushSubscriptionsInNotification } from "#src/schema/notification/pushSubscriptionsInNotification";
import { likesInPost } from "#src/schema/post/likesInPost";
import { postsInPost } from "#src/schema/post/postsInPost";
import { programParticipantsInResource } from "#src/schema/resource/programParticipantsInResource";
import { resourceAccessesInResource } from "#src/schema/resource/resourceAccessesInResource";
import { resourceActivitiesInResource } from "#src/schema/resource/resourceActivitiesInResource";
import { resourceFavoritesInResource } from "#src/schema/resource/resourceFavoritesInResource";
import { resourceLinksInResource } from "#src/schema/resource/resourceLinksInResource";
import { resourceObjectLocksInResource } from "#src/schema/resource/resourceObjectLocksInResource";
import { resourcePublicationsInResource } from "#src/schema/resource/resourcePublicationsInResource";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { resourceVersionAssetsInResource } from "#src/schema/resource/resourceVersionAssetsInResource";
import { resourceVersionsInResource } from "#src/schema/resource/resourceVersionsInResource";
import { resourceViewsInResource } from "#src/schema/resource/resourceViewsInResource";
import { resourceWorkingAssetsInResource } from "#src/schema/resource/resourceWorkingAssetsInResource";
import { surveyResponsesInResource } from "#src/schema/resource/surveyResponsesInResource";
import { blocksInSocial } from "#src/schema/social/blocksInSocial";
import { friendRequestsInSocial } from "#src/schema/social/friendRequestsInSocial";
import { friendsInSocial } from "#src/schema/social/friendsInSocial";
import { storageLedgerInStorage } from "#src/schema/storage/storageLedgerInStorage";
import { dataExportsInUser } from "#src/schema/user/dataExportsInUser";

export const schema = {
  accountsInAuth,
  achievementsInAchievement,
  apiKeysInAuth,
  appUsersInMessage,
  bansInMessage,
  blocksInSocial,
  bookmarksInApp,
  callSessionsInMessage,
  dataExportsInUser,
  friendRequestsInSocial,
  friendsInSocial,
  invitesInMessage,
  likesInPost,
  messageEmojisInMessage,
  messagesInMessage,
  moderationLogsInMessage,
  moderationNotesInMessage,
  notificationsInNotification,
  postsInPost,
  programParticipantsInResource,
  pushSubscriptionsInNotification,
  rateLimiterFlexibleInApp,
  resourceAccessesInResource,
  resourceActivitiesInResource,
  resourceFavoritesInResource,
  resourceLinksInResource,
  resourceObjectLocksInResource,
  resourcePublicationsInResource,
  resourcesInResource,
  resourceVersionAssetsInResource,
  resourceVersionsInResource,
  resourceViewsInResource,
  resourceWorkingAssetsInResource,
  roomCategoriesInMessage,
  roomEmojisInMessage,
  roomFiltersInMessage,
  roomMemberPermissionsInMessage,
  roomRolesInMessage,
  roomsInMessage,
  searchHistoriesInMessage,
  sessionsInAuth,
  storageLedgerInStorage,
  surveyResponsesInResource,
  threadFollowsInMessage,
  userAchievementsInAchievement,
  userSettingsInMessage,
  usersInAuth,
  userStatusesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  verificationsInAuth,
  webhooksInMessage,
};
