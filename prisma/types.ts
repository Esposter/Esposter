import { Prisma } from "@prisma/client";

export const PostRelationsIncludeDefault = { creator: true, likes: true } satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{ include: typeof PostRelationsIncludeDefault }>;
