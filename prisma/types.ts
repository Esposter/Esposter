import type { Prisma } from "@prisma/client";

export const PostRelationsIncludeDefault = { creator: true, likes: true } satisfies Prisma.PostInclude;
// @NOTE: https://github.com/drizzle-team/drizzle-orm/issues/695
export type PostWithRelations = Prisma.PostGetPayload<{ include: typeof PostRelationsIncludeDefault }>;
