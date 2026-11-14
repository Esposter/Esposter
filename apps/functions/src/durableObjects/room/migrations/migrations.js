import m0000 from "./20261114071913_room_messages_and_search/migration.sql";
import m0001 from "./20261114074218_room_scheduled_messages_and_state/migration.sql";
import m0002 from "./20261114084801_room_app_user_image/migration.sql";

export default {
  migrations: {
    "20261114071913_room_messages_and_search": m0000,
    "20261114074218_room_scheduled_messages_and_state": m0001,
    "20261114084801_room_app_user_image": m0002,
  },
};
