import * as accounts from "@/schema/accounts";
import * as achievements from "@/schema/achievements";
import * as appUsersInMessage from "@/schema/appUsersInMessage";
import * as invitesInMessage from "@/schema/invitesInMessage";
import * as likes from "@/schema/likes";
import * as posts from "@/schema/posts";
import * as pushSubscriptionsInMessage from "@/schema/pushSubscriptionsInMessage";
import * as rateLimiterFlexible from "@/schema/rateLimiterFlexible";
import * as rooms from "@/schema/rooms";
import * as searchHistories from "@/schema/searchHistories";
import * as sessions from "@/schema/sessions";
import * as surveys from "@/schema/surveys";
import * as userAchievements from "@/schema/userAchievements";
import * as users from "@/schema/users";
import * as userStatuses from "@/schema/userStatuses";
import * as usersToRooms from "@/schema/usersToRooms";
import * as verifications from "@/schema/verifications";
import * as webhooks from "@/schema/webhooks";

export const schema = {
  ...accounts,
  ...achievements,
  ...appUsersInMessage,
  ...invitesInMessage,
  ...likes,
  ...posts,
  ...pushSubscriptionsInMessage,
  ...rateLimiterFlexible,
  ...rooms,
  ...searchHistories,
  ...sessions,
  ...surveys,
  ...userAchievements,
  ...users,
  ...userStatuses,
  ...usersToRooms,
  ...verifications,
  ...webhooks,
};
