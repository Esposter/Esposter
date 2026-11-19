import type { Database, UserInAuth } from "@esposter/db-schema";

import { publishTopics } from "#server/services/realtime/publishTopics";
import { MAX_CONCURRENT_PROFILE_TOPIC_PUBLISHES } from "#server/services/user/constants";
import { getMemberRoomIds, getPersonReaderTopics } from "@esposter/db";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { settleAll } from "@esposter/shared";

// A save of the profile changes the name and image that other people's reads show: each room the person is in, whose
// Members read them through the room's topic, and the reads that name the person from their rows, such as a request, a
// Block, a post thread, a ban or a log entry. Each topic is published once, in bounded width rather than all at once
export const publishProfileTopics = async (db: Database, userId: UserInAuth["id"]): Promise<void> => {
  const [roomIds, readerTopics] = await Promise.all([getMemberRoomIds(db, userId), getPersonReaderTopics(db, userId)]);
  const topics = new Set([...roomIds.map((roomId) => getTopic(TopicKind.Room, roomId)), ...readerTopics]);
  await settleAll(
    Array.from(topics, (topic) => () => publishTopics([{ topic }])),
    MAX_CONCURRENT_PROFILE_TOPIC_PUBLISHES,
  );
};
