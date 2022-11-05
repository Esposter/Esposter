import type { User as PrismaUser } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { USER_MAX_USERNAME_LENGTH } from "@/util/constants.common";
import { publicProcedure, router } from "@/server/trpc";
import { prisma } from "@/prisma";

export const userSchema: toZod<PrismaUser> = z.object({
  id: z.string().uuid(),
  username: z.string().min(1).max(USER_MAX_USERNAME_LENGTH),
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
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => prisma.user.create({ data: { ...input, id: uuidv4() } })),
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input: { id, ...other } }) => prisma.user.update({ data: other, where: { id } })),
  deleteUser: publicProcedure.input(deleteUserInputSchema).mutation(async ({ input }) => {
    try {
      await prisma.user.delete({ where: { id: input } });
      return true;
    } catch (err) {
      return false;
    }
  }),
});
