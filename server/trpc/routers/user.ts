import { prisma } from "@/prisma";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";
import { USER_USERNAME_MAX_LENGTH } from "@/util/constants.common";
import type { User as PrismaUser } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const userSchema: toZod<PrismaUser> = z.object({
  id: z.string().uuid(),
  username: z.string().min(1).max(USER_USERNAME_MAX_LENGTH),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

const createUserInputSchema = userSchema.pick({ username: true });
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

const updateUserInputSchema = userSchema.pick({ id: true }).merge(userSchema.partial().pick({ username: true }));
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

const deleteUserInputSchema = userSchema.shape.id;
export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>;

export const userRouter = router({
  createUser: rateLimitedProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => prisma.user.create({ data: { ...input, id: uuidv4() } })),
  updateUser: rateLimitedProcedure
    .input(updateUserInputSchema)
    .mutation(({ input: { id, ...other } }) => prisma.user.update({ data: other, where: { id } })),
  deleteUser: rateLimitedProcedure.input(deleteUserInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.user.delete({ where: { id: input } });
      return true;
    } catch (err) {
      return false;
    }
  }),
});
