import m0000 from "#src/objects/user/migrations/20261114070754_groovy_galactus/migration.sql";
import m0001 from "#src/objects/user/migrations/20261114102921_user_reminders/migration.sql";
import m0002 from "#src/objects/user/migrations/20261115011307_user_joined_calls/migration.sql";

export default {
  migrations: {
    "20261114070754_groovy_galactus": m0000,
    "20261114102921_user_reminders": m0001,
    "20261115011307_user_joined_calls": m0002,
  },
};
