import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const blocksRelation = defineRelationsPart(schema, (r) => ({
  blocks: {
    blocked: r.one.users({
      from: r.blocks.blockedId,
      optional: false,
      to: r.users.id,
    }),
    blocker: r.one.users({
      from: r.blocks.blockerId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const BlockRelations = {
  blocked: true,
} as const;
