import { Prisma } from "@prisma/client";

// @NOTE: Update to use satisfies Prisma.PostInclude after ts 4.9
export const PostRelationsIncludeDefault = { creator: true, likes: true };

export type PostWithRelations = Prisma.PostGetPayload<{ include: typeof PostRelationsIncludeDefault }>;
