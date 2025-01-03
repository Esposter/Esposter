import * as accounts from "#shared/db/schema/accounts";
import * as posts from "#shared/db/schema/posts";
import * as rooms from "#shared/db/schema/rooms";
import * as sessions from "#shared/db/schema/sessions";
import * as surveys from "#shared/db/schema/surveys";
import * as users from "#shared/db/schema/users";
import * as verifications from "#shared/db/schema/verifications";

export const schema = {
  ...accounts,
  ...posts,
  ...rooms,
  ...sessions,
  ...surveys,
  ...users,
  ...verifications,
};
