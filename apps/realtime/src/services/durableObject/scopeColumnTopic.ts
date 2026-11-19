import type { ColumnTopic } from "@esposter/db-schema";

import { topicSchema } from "@esposter/db-schema";

// A topic of an object's own table names the object it belongs to, `<kind>/<id>:<table topic>`, so a write in one object reaches
// No watch of another. The scoped name is parsed, so it is one the topic schema accepts
export const scopeColumnTopic = (columnTopic: ColumnTopic, scope: string): ColumnTopic => ({
  ...columnTopic,
  topic: topicSchema.parse(`${scope}:${columnTopic.topic}`),
});
