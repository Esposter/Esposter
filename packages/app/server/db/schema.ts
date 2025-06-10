import * as accounts from "#shared/db/schema/accounts";
import * as invites from "#shared/db/schema/invites";
import * as likes from "#shared/db/schema/likes";
import * as posts from "#shared/db/schema/posts";
import * as rooms from "#shared/db/schema/rooms";
import * as sessions from "#shared/db/schema/sessions";
import * as surveys from "#shared/db/schema/surveys";
import * as users from "#shared/db/schema/users";
import * as usersToRooms from "#shared/db/schema/usersToRooms";
import * as verifications from "#shared/db/schema/verifications";

export const schema = {
  ...accounts,
  ...invites,
  ...posts,
  ...rooms,
  ...sessions,
  ...surveys,
  ...users,
  ...verifications,
  ...likes,
  ...usersToRooms,
};
