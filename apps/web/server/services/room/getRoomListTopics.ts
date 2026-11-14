import type { Topic } from "@esposter/db-schema";

import { getTopic } from "#shared/services/realtime/getTopic";
import { TopicKind } from "@esposter/db-schema";

// A person's list of rooms, with their categories and membership rows, which the sidebar reads
export const getRoomListTopics = (userId: string): Topic[] => [getTopic(TopicKind.RoomList, userId)];
