import type { z } from "zod";

import { getProcedureTopics } from "#server/services/realtime/getProcedureTopics";
import { getResourceListTopics } from "#server/trpc/procedure/resource/getResourceListTopics";
import { getTopic } from "#shared/services/realtime/getTopic";
import { TopicKind } from "@esposter/db-schema";

// The topics of a procedure that changes one resource: the resource itself and its owner's list of resources, which
// Every listing of the resources reads
export const getChangedResourceTopics = (schema: z.ZodType<{ id: string }>) =>
  getProcedureTopics(schema, ({ id }, { userId }) => [
    getTopic(TopicKind.Resource, id),
    ...getResourceListTopics(userId),
  ]);
