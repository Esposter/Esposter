import { columnTopicSchema, topicSchema } from "#src/models/realtime/Topic";
import { MAX_FRAME_TOPICS, MAX_READ_TOPICS } from "#src/services/realtime/constants";
import { z } from "zod";

// The frames a tab sends up its own user socket: the topics its mounted queries read, watched as the first query on a
// Topic mounts and unwatched as the last one unmounts. A reconnecting tab watches every topic again. A watch is one
// Read the server signed for the person (`TopicRead`): its server time, the signature over it and the person, and the
// Topics the read named with the columns each reads. The signature covers exactly those topics, so a frame naming
// Another is refused
const watchFrameSchema = z.object({
  data: z.object({
    readAt: z.int().nonnegative(),
    // The server's signature over the read. A tab that predates signatures sends none, so its frame fails this schema
    // And is dropped unanswered, and an empty or mismatched signature is refused by the object
    signature: z.string().max(64),
    topics: z.array(columnTopicSchema).min(1).max(MAX_READ_TOPICS),
  }),
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
