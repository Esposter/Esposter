import type { User } from "@/shared/db/schema/users";
import type { z } from "zod";

import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { getProfanityFilterProcedure } from "@/server/trpc/procedure/getProfanityFilterProcedure";
import { selectUserSchema, users } from "@/shared/db/schema/users";
import { eq } from "drizzle-orm";

const readUserInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserInput = z.infer<typeof readUserInputSchema>;

export const updateUserInputSchema = selectUserSchema.pick({ name: true });
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const userRouter = router({
  readUser: authedProcedure.input(readUserInputSchema).query(
    ({ ctx, input }) =>
      ctx.db.query.users.findFirst({
        columns: {
          createdAt: true,
          deletedAt: true,
          // Exclude email unless it's their own user reading it
          email: !input || input === ctx.session.user.id,
          emailVerified: true,
          id: true,
          image: true,
          name: true,
          updatedAt: true,
        },
        // We'll assume no input as user reading their own info
        where: (users, { eq }) => eq(users.id, input ?? ctx.session.user.id),
        // @TODO: https://github.com/drizzle-team/drizzle-orm/issues/1163
      }) as Promise<undefined | User>,
  ),
  updateUser: getProfanityFilterProcedure(updateUserInputSchema, ["name"])
    .input(updateUserInputSchema)
    .mutation<null | User>(async ({ ctx, input }) => {
      const updatedUser = (
        await ctx.db.update(users).set(input).where(eq(users.id, ctx.session.user.id)).returning()
      ).find(Boolean);
      return updatedUser ?? null;
    }),
});
