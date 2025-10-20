import * as accounts from "@/schema/accounts";
import * as appUsers from "@/schema/appUsers";
import * as invites from "@/schema/invites";
import * as likes from "@/schema/likes";
import * as posts from "@/schema/posts";
import * as pushSubscriptions from "@/schema/pushSubscriptions";
import * as rateLimiterFlexible from "@/schema/rateLimiterFlexible";
import * as rooms from "@/schema/rooms";
import * as searchHistories from "@/schema/searchHistories";
import * as sessions from "@/schema/sessions";
import * as surveys from "@/schema/surveys";
import * as users from "@/schema/users";
import * as userStatuses from "@/schema/userStatuses";
import * as usersToRooms from "@/schema/usersToRooms";
import * as verifications from "@/schema/verifications";
import * as webhooks from "@/schema/webhooks";

export const schema = {
  ...accounts,
  ...appUsers,
  ...invites,
  ...likes,
  ...posts,
  ...pushSubscriptions,
  ...rateLimiterFlexible,
  ...rooms,
  ...searchHistories,
  ...sessions,
  ...surveys,
  ...users,
  ...userStatuses,
  ...usersToRooms,
  ...verifications,
  ...webhooks,
};
