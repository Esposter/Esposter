import { Prisma } from "@prisma/client";

export type PostWithCreator = Prisma.PostGetPayload<{ include: { creator: true } }>;
