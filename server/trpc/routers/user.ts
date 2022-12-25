import { USER_NAME_MAX_LENGTH } from "@/util/constants.common";
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
