import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { userSchema } from "@/server/trpc/routers/user";
import { ROOM_NAME_MAX_LENGTH } from "@/utils/validation";
import type { Room } from "@prisma/client";
import { z } from "zod";

export const roomSchema = itemMetadataSchema.merge(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(ROOM_NAME_MAX_LENGTH),
    image: z.string().nullable(),
    creatorId: userSchema.shape.id,
  }),
) satisfies z.ZodType<Room>;
