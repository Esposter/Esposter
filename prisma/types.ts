import { Prisma } from "@prisma/client";

export type PostWithRelations = Prisma.PostGetPayload<{ include: { creator: true } }>;
