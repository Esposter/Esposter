import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const blocksInSocialRelation = defineRelationsPart(schema, (r) => ({
  blocksInSocial: {
    blocked: r.one.usersInAuth({ from: r.blocksInSocial.blockedId, optional: false, to: r.usersInAuth.id }),
    blocker: r.one.usersInAuth({ from: r.blocksInSocial.blockerId, optional: false, to: r.usersInAuth.id }),
  },
}));

export const BlockInSocialRelations = { blocked: { columns: PublicUserColumns } } as const;
