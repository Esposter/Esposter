import m0000 from "#src/objects/call/migrations/20261114071310_parched_hellcat/migration.sql";
import m0001 from "#src/objects/call/migrations/20261114135626_call_participant_image_not_null/migration.sql";
import m0002 from "#src/objects/call/migrations/20261115020054_call_connected_at/migration.sql";

export default {
  migrations: {
    "20261114071310_parched_hellcat": m0000,
    "20261114135626_call_participant_image_not_null": m0001,
    "20261115020054_call_connected_at": m0002,
  },
};
