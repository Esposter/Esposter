import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { USER_NAME_MAX_LENGTH } from "@/utils/validation";
import type { User } from "@prisma/client";
import { z } from "zod";

export const userSchema = itemMetadataSchema.merge(
  z.object({
    id: z.string().cuid(),
    name: z.string().max(USER_NAME_MAX_LENGTH).nullable(),
    email: z.string().nullable(),
    emailVerified: z.date().nullable(),
    image: z.string().nullable(),
  }),
) satisfies z.ZodType<User>;

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
        : prisma.user.findUnique({ where: { id: ctx.session.user.id } }),
    ),
});
