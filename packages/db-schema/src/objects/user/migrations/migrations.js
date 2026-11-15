import m0000 from "#src/objects/user/migrations/20261114070754_groovy_galactus/migration.sql";
import m0001 from "#src/objects/user/migrations/20261114102921_user_reminders/migration.sql";
import m0002 from "#src/objects/user/migrations/20261115011307_user_joined_calls/migration.sql";
import m0003 from "#src/objects/user/migrations/20261115072721_user_keyset_indexes/migration.sql";

export default {
  migrations: {
    "20261114070754_groovy_galactus": m0000,
    "20261114102921_user_reminders": m0001,
    "20261115011307_user_joined_calls": m0002,
    "20261115072721_user_keyset_indexes": m0003,
  },
};
