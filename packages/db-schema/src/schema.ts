import * as accounts from "@/schema/accounts";
import * as achievements from "@/schema/achievements";
import * as appUsers from "@/schema/appUsers";
import * as blocks from "@/schema/blocks";
import * as friendRequests from "@/schema/friendRequests";
import * as friends from "@/schema/friends";
import * as invites from "@/schema/invites";
import * as likes from "@/schema/likes";
import * as posts from "@/schema/posts";
import * as pushSubscriptions from "@/schema/pushSubscriptions";
import * as rateLimiterFlexible from "@/schema/rateLimiterFlexible";
import * as roomCategories from "@/schema/roomCategories";
import * as roomRoles from "@/schema/roomRoles";
import * as rooms from "@/schema/rooms";
import * as searchHistories from "@/schema/searchHistories";
import * as sessions from "@/schema/sessions";
import * as surveys from "@/schema/surveys";
import * as userAchievements from "@/schema/userAchievements";
import * as users from "@/schema/users";
import * as userStatuses from "@/schema/userStatuses";
import * as usersToRoomRoles from "@/schema/usersToRoomRoles";
import * as usersToRooms from "@/schema/usersToRooms";
import * as verifications from "@/schema/verifications";
import * as webhooks from "@/schema/webhooks";

export const schema = {
  ...accounts,
  ...achievements,
  ...appUsers,
  ...blocks,
  ...friendRequests,
  ...friends,
  ...invites,
  ...likes,
  ...posts,
  ...pushSubscriptions,
  ...rateLimiterFlexible,
  ...roomCategories,
  ...roomRoles,
  ...rooms,
  ...searchHistories,
  ...sessions,
  ...surveys,
  ...userAchievements,
  ...users,
  ...userStatuses,
  ...usersToRoomRoles,
  ...usersToRooms,
  ...verifications,
  ...webhooks,
};
