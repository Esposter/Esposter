import type { z } from "zod";

import { getProcedureTopics } from "#server/services/realtime/getProcedureTopics";
import { getTopic } from "#shared/services/realtime/getTopic";
import { TopicKind } from "@esposter/db-schema";

// The topics of a procedure on one resource that reads or changes only that resource's own state
export const getResourceTopics = (schema: z.ZodType<{ id: string }>) =>
  getProcedureTopics(schema, ({ id }) => [getTopic(TopicKind.Resource, id)]);
