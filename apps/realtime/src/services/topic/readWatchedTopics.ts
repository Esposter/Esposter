import type { Topic } from "@esposter/db-schema";

import { topicSchema } from "@esposter/db-schema";
import { z } from "zod";

const socketAttachmentSchema = z.object({ topics: z.array(topicSchema) });

// The topics a user socket's tab watches, kept in the socket's attachment so the record survives the object's
// Hibernation. A socket that never watched holds no attachment
export const readWatchedTopics = (socket: WebSocket): Topic[] => {
  const attachment = socketAttachmentSchema.safeParse(socket.deserializeAttachment());
  return attachment.success ? attachment.data.topics : [];
};
