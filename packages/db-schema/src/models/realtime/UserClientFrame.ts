import { topicSchema } from "#src/models/realtime/Topic";
import { z } from "zod";

// The frames a tab sends up its own user socket: the topics its mounted queries read, watched as the first query on a
// Topic mounts and unwatched as the last one unmounts. A reconnecting tab watches every topic again
const watchFrameSchema = z.object({
  data: z.object({ topics: z.array(topicSchema).min(1) }),
  type: z.literal("watch"),
});
const unwatchFrameSchema = z.object({
  data: z.object({ topics: z.array(topicSchema).min(1) }),
  type: z.literal("unwatch"),
});

const userClientFrameSchemas = [watchFrameSchema, unwatchFrameSchema] as const;

export type UserClientFrame = z.infer<(typeof userClientFrameSchemas)[number]>;

export const userClientFrameSchema = z.discriminatedUnion(
  "type",
  userClientFrameSchemas,
) satisfies z.ZodType<UserClientFrame>;
