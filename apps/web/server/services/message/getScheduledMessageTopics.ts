import type { Topic } from "@esposter/db-schema";
import type { User } from "better-auth";

import { getTopic, TopicKind } from "@esposter/db-schema";

// The person's scheduled items, reminders and scheduled messages alike, which only their own writes change. No object
// Pushes them as events, so readers learn of a change through this topic
export const getScheduledMessageTopics = ({ ctx }: { ctx: { user: User } }): Topic[] => [
  getTopic(TopicKind.ScheduledMessage, ctx.user.id),
];
