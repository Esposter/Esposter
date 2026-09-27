import { schema } from "#src/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const blocksRelation = defineRelationsPart(schema, (r) => ({
  blocks: {
    blocked: r.one.users({ from: r.blocks.blockedId, optional: false, to: r.users.id }),
    blocker: r.one.users({ from: r.blocks.blockerId, optional: false, to: r.users.id }),
  },
}));

export const BlockRelations = { blocked: { columns: PublicUserColumns } } as const;
