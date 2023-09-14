import { db } from "@/db";
import type { User } from "@/db/schema/users";
import { selectUserSchema } from "@/db/schema/users";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { z } from "zod";

const readUserInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserInput = z.infer<typeof readUserInputSchema>;

export const userRouter = router({
  readUser: authedProcedure.input(readUserInputSchema).query(
    ({ input, ctx }) =>
      db.query.users.findFirst({
        // We'll assume no input as user reading their own info
        where: (users, { eq }) => eq(users.id, input ?? ctx.session.user.id),
        columns: {
          id: true,
          name: true,
          // Exclude email unless it's their own user reading it
          email: !input || input === ctx.session.user.id,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        // @NOTE: https://github.com/drizzle-team/drizzle-orm/issues/1163
      }) as Promise<User | undefined>,
  ),
});
