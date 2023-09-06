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
        where: (users, { eq }) => eq(users.id, input ?? ctx.session.user.id),
        // Exclude email unless it's their own user reading it
        columns: { email: input === ctx.session.user.id },
        // @NOTE: https://github.com/drizzle-team/drizzle-orm/issues/1163
      }) as Promise<User | undefined>,
  ),
});
