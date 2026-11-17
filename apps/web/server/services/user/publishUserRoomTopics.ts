import type { Database, UserInAuth } from "@esposter/db-schema";

import { publishTopics } from "#server/services/realtime/publishTopics";
import { MAX_CONCURRENT_ROOM_TOPIC_PUBLISHES } from "#server/services/user/constants";
import { getMemberRoomIds } from "@esposter/db";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { settleAll } from "@esposter/shared";

// A person's name and image show in every room they are in, and a room's members read them through the room's topic,
// So a save publishes the topic of each room the person is a member of. The publishes run in bounded width, not all at once
export const publishUserRoomTopics = async (db: Database, userId: UserInAuth["id"]): Promise<void> => {
  const roomIds = await getMemberRoomIds(db, userId);
  const roomTopics = roomIds.map((roomId) => getTopic(TopicKind.Room, roomId));
  await settleAll(
    roomTopics.map((topic) => () => publishTopics([topic])),
    MAX_CONCURRENT_ROOM_TOPIC_PUBLISHES,
  );
};
