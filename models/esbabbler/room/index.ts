import { ROOM_NAME_MAX_LENGTH } from "@/utils/validation";
import type { Room } from "@prisma/client";
import { z } from "zod";

export const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(ROOM_NAME_MAX_LENGTH),
  image: z.string().nullable(),
  creatorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}) satisfies z.ZodType<Room>;
