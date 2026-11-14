import type { User } from "better-auth";
import type { Topic } from "@esposter/db-schema";

import { getResourceListTopics } from "#server/services/resource/getResourceListTopics";
import { getResourceTopics } from "#server/services/resource/getResourceTopics";

// The topics of a procedure that changes one resource: the resource itself and its owner's list of resources, which
// Every listing of the resources reads
export const getChangedResourceTopics = (options: { ctx: { user: User }; input: { id: string } }): Topic[] => [
  ...getResourceTopics(options),
  ...getResourceListTopics(options.ctx.user.id),
];
