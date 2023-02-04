import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { USER_NAME_MAX_LENGTH } from "@/utils/constants.common";
import type { User as PrismaUser } from "@prisma/client";
import type { toZod } from "tozod";
import { z } from "zod";

export const userSchema: toZod<PrismaUser> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(USER_NAME_MAX_LENGTH).nullable(),
  email: z.string().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const readUserInputSchema = userSchema.shape.id.optional();
export type ReadUserInput = z.infer<typeof readUserInputSchema>;

export const userRouter = router({
  readUser: authedProcedure
    .input(readUserInputSchema)
    // @NOTE: Exclude email unless it's their own user reading it
    // https://github.com/prisma/prisma/issues/5042
    .query(({ input, ctx }) =>
      input
        ? prisma.user.findUnique({ where: { id: input } })
        : prisma.user.findUnique({ where: { id: ctx.session.user.id } })
    ),
});
