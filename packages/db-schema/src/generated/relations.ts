import { achievementsInAchievementRelation } from "#src/relations/achievement/achievementsInAchievementRelation";
import { userAchievementsInAchievementRelation } from "#src/relations/achievement/userAchievementsInAchievementRelation";
import { bookmarksInAppRelation } from "#src/relations/app/bookmarksInAppRelation";
import { accountsInAuthRelation } from "#src/relations/auth/accountsInAuthRelation";
import { sessionsInAuthRelation } from "#src/relations/auth/sessionsInAuthRelation";
import { usersInAuthRelation } from "#src/relations/auth/usersInAuthRelation";
import { appUsersInMessageRelation } from "#src/relations/message/appUsersInMessageRelation";
import { bansInMessageRelation } from "#src/relations/message/bansInMessageRelation";
import { callSessionsInMessageRelation } from "#src/relations/message/callSessionsInMessageRelation";
import { invitesInMessageRelation } from "#src/relations/message/invitesInMessageRelation";
import { messagesInMessageRelation } from "#src/relations/message/messagesInMessageRelation";
import { moderationLogsInMessageRelation } from "#src/relations/message/moderationLogsInMessageRelation";
import { moderationNotesInMessageRelation } from "#src/relations/message/moderationNotesInMessageRelation";
import { roomCategoriesInMessageRelation } from "#src/relations/message/roomCategoriesInMessageRelation";
import { roomEmojisInMessageRelation } from "#src/relations/message/roomEmojisInMessageRelation";
import { roomFiltersInMessageRelation } from "#src/relations/message/roomFiltersInMessageRelation";
import { roomMemberPermissionsInMessageRelation } from "#src/relations/message/roomMemberPermissionsInMessageRelation";
import { roomRolesInMessageRelation } from "#src/relations/message/roomRolesInMessageRelation";
import { roomsInMessageRelation } from "#src/relations/message/roomsInMessageRelation";
import { scheduledMessageJobsInMessageRelation } from "#src/relations/message/scheduledMessageJobsInMessageRelation";
import { searchHistoriesInMessageRelation } from "#src/relations/message/searchHistoriesInMessageRelation";
import { threadFollowsInMessageRelation } from "#src/relations/message/threadFollowsInMessageRelation";
import { userSettingsInMessageRelation } from "#src/relations/message/userSettingsInMessageRelation";
import { userStatusesInMessageRelation } from "#src/relations/message/userStatusesInMessageRelation";
import { usersToRoomRolesInMessageRelation } from "#src/relations/message/usersToRoomRolesInMessageRelation";
import { usersToRoomsInMessageRelation } from "#src/relations/message/usersToRoomsInMessageRelation";
import { webhooksInMessageRelation } from "#src/relations/message/webhooksInMessageRelation";
import { notificationsInNotificationRelation } from "#src/relations/notification/notificationsInNotificationRelation";
import { pushSubscriptionsInNotificationRelation } from "#src/relations/notification/pushSubscriptionsInNotificationRelation";
import { likesInPostRelation } from "#src/relations/post/likesInPostRelation";
import { postsInPostRelation } from "#src/relations/post/postsInPostRelation";
import { programParticipantsInResourceRelation } from "#src/relations/resource/programParticipantsInResourceRelation";
import { resourceAccessesInResourceRelation } from "#src/relations/resource/resourceAccessesInResourceRelation";
import { resourceActivitiesInResourceRelation } from "#src/relations/resource/resourceActivitiesInResourceRelation";
import { resourceFavoritesInResourceRelation } from "#src/relations/resource/resourceFavoritesInResourceRelation";
import { resourceLinksInResourceRelation } from "#src/relations/resource/resourceLinksInResourceRelation";
import { resourcePublicationsInResourceRelation } from "#src/relations/resource/resourcePublicationsInResourceRelation";
import { resourcesInResourceRelation } from "#src/relations/resource/resourcesInResourceRelation";
import { resourceVersionAssetsInResourceRelation } from "#src/relations/resource/resourceVersionAssetsInResourceRelation";
import { resourceVersionsInResourceRelation } from "#src/relations/resource/resourceVersionsInResourceRelation";
import { resourceViewsInResourceRelation } from "#src/relations/resource/resourceViewsInResourceRelation";
import { resourceWorkingAssetsInResourceRelation } from "#src/relations/resource/resourceWorkingAssetsInResourceRelation";
import { surveyResponsesInResourceRelation } from "#src/relations/resource/surveyResponsesInResourceRelation";
import { blocksInSocialRelation } from "#src/relations/social/blocksInSocialRelation";
import { friendRequestsInSocialRelation } from "#src/relations/social/friendRequestsInSocialRelation";
import { friendsInSocialRelation } from "#src/relations/social/friendsInSocialRelation";
import { storageLedgerInStorageRelation } from "#src/relations/storage/storageLedgerInStorageRelation";
import { dataExportsInUserRelation } from "#src/relations/user/dataExportsInUserRelation";

export const relations = {
  ...accountsInAuthRelation,
  ...achievementsInAchievementRelation,
  ...appUsersInMessageRelation,
  ...bansInMessageRelation,
  ...blocksInSocialRelation,
  ...bookmarksInAppRelation,
  ...callSessionsInMessageRelation,
  ...dataExportsInUserRelation,
  ...friendRequestsInSocialRelation,
  ...friendsInSocialRelation,
  ...invitesInMessageRelation,
  ...likesInPostRelation,
  ...messagesInMessageRelation,
  ...moderationLogsInMessageRelation,
  ...moderationNotesInMessageRelation,
  ...notificationsInNotificationRelation,
  ...postsInPostRelation,
  ...programParticipantsInResourceRelation,
  ...pushSubscriptionsInNotificationRelation,
  ...resourceAccessesInResourceRelation,
  ...resourceActivitiesInResourceRelation,
  ...resourceFavoritesInResourceRelation,
  ...resourceLinksInResourceRelation,
  ...resourcePublicationsInResourceRelation,
  ...resourcesInResourceRelation,
  ...resourceVersionAssetsInResourceRelation,
  ...resourceVersionsInResourceRelation,
  ...resourceViewsInResourceRelation,
  ...resourceWorkingAssetsInResourceRelation,
  ...roomCategoriesInMessageRelation,
  ...roomEmojisInMessageRelation,
  ...roomFiltersInMessageRelation,
  ...roomMemberPermissionsInMessageRelation,
  ...roomRolesInMessageRelation,
  ...roomsInMessageRelation,
  ...scheduledMessageJobsInMessageRelation,
  ...searchHistoriesInMessageRelation,
  ...sessionsInAuthRelation,
  ...storageLedgerInStorageRelation,
  ...surveyResponsesInResourceRelation,
  ...threadFollowsInMessageRelation,
  ...userAchievementsInAchievementRelation,
  ...userSettingsInMessageRelation,
  ...usersInAuthRelation,
  ...userStatusesInMessageRelation,
  ...usersToRoomRolesInMessageRelation,
  ...usersToRoomsInMessageRelation,
  ...webhooksInMessageRelation,
};
