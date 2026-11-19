import { columnTopicSchema, topicSchema } from "#src/models/realtime/Topic";
import { MAX_FRAME_TOPICS } from "#src/services/realtime/constants";
import { z } from "zod";

// The frames a tab sends up its own user socket: the topics its mounted queries read, watched as the first query on a
// Topic mounts and unwatched as the last one unmounts. A reconnecting tab watches every topic again. A watch names the
// Server time its read began, so the topic's object can tell whether a publish came after that read, and the columns the
// Read references in each topic, so the object tells whether a publish changed one of them
const watchFrameSchema = z.object({
  data: z.object({ readAt: z.int().nonnegative(), topics: z.array(columnTopicSchema).min(1).max(MAX_FRAME_TOPICS) }),
  type: z.literal("watch"),
});
const unwatchFrameSchema = z.object({
  data: z.object({ topics: z.array(topicSchema).min(1).max(MAX_FRAME_TOPICS) }),
  type: z.literal("unwatch"),
});

const userClientFrameSchemas = [watchFrameSchema, unwatchFrameSchema] as const;

export type UserClientFrame = z.infer<(typeof userClientFrameSchemas)[number]>;

export const userClientFrameSchema = z.discriminatedUnion(
  "type",
  userClientFrameSchemas,
) satisfies z.ZodType<UserClientFrame>;
