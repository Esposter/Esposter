import { db } from "@/db";
import { selectUserSchema } from "@/db/schema/users";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { z } from "zod";

const readUserInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserInput = z.infer<typeof readUserInputSchema>;

export const userRouter = router({
  readUser: authedProcedure
    .input(readUserInputSchema)
    // Exclude email unless it's their own user reading it
    .query(({ input, ctx }) =>
      db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input ?? ctx.session.user.id),
        columns: { email: input === ctx.session.user.id },
      }),
    ),
});
