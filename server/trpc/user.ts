import { createRouter } from "@/server/trpc/createRouter";
import { prisma } from "@/server/trpc/prisma";
import { USER_MAX_NAME_LENGTH } from "@/util/constants";
import type { User as PrismaUser } from "@prisma/client";
import { toZod } from "tozod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const userSchema: toZod<PrismaUser> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(USER_MAX_NAME_LENGTH),
  username: z.string().min(1).max(USER_MAX_NAME_LENGTH),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
export type User = z.infer<typeof userSchema>;

const createUserInputSchema = userSchema.pick({ name: true, username: true });
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

const updateUserInputSchema = userSchema
  .pick({ id: true })
  .merge(userSchema.partial().pick({ name: true, username: true }));
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

const deleteUserInputSchema = userSchema.pick({ id: true });
export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>;

export const userRouter = createRouter()
  .mutation("createUser", {
    input: createUserInputSchema,
    resolve: ({ input }) => prisma.user.create({ data: { id: uuidv4(), ...input } }),
  })
  .mutation("updateUser", {
    input: updateUserInputSchema,
    resolve: ({ input: { id, ...other } }) => prisma.user.update({ data: other, where: { id } }),
  })
  .mutation("deleteUser", {
    input: deleteUserInputSchema,
    resolve: async ({ input: { id } }) => {
      try {
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  });
