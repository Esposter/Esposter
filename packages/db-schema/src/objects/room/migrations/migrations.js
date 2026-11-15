import m0000 from "#src/objects/room/migrations/20261114071913_room_messages_and_search/migration.sql";
import m0001 from "#src/objects/room/migrations/20261114074218_room_scheduled_messages_and_state/migration.sql";
import m0002 from "#src/objects/room/migrations/20261114084801_room_app_user_image/migration.sql";
import m0003 from "#src/objects/room/migrations/20261114090937_room_webhook_delivery_id/migration.sql";
import m0004 from "#src/objects/room/migrations/20261115014940_room_message_indexes/migration.sql";
import m0005 from "#src/objects/room/migrations/20261115072720_room_created_at_index/migration.sql";
import m0006 from "#src/objects/room/migrations/20261115083142_room_edited_at_and_unindexed_messages/migration.sql";

export default {
  migrations: {
    "20261114071913_room_messages_and_search": m0000,
    "20261114074218_room_scheduled_messages_and_state": m0001,
    "20261114084801_room_app_user_image": m0002,
    "20261114090937_room_webhook_delivery_id": m0003,
    "20261115014940_room_message_indexes": m0004,
    "20261115072720_room_created_at_index": m0005,
    "20261115083142_room_edited_at_and_unindexed_messages": m0006,
  },
};
