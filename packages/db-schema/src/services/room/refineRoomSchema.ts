import type { z } from "zod";

import { RoomType } from "#src/models/message/RoomType";
import { createNameSchema } from "#src/models/shared/Name";
import { ROOM_NAME_MAX_LENGTH } from "#src/services/room/constants";
import { normalizeString } from "@esposter/shared";

const roomNameSchema = createNameSchema(ROOM_NAME_MAX_LENGTH);

export const refineRoomSchema = <TSchema extends z.ZodType<Partial<{ name: string; type: RoomType }>>>(
  schema: TSchema,
  roomType = RoomType.Room,
): TSchema =>
  schema.superRefine(({ name, type }, ctx) => {
    if (name === undefined) return;

    if ((type ?? roomType) === RoomType.DirectMessage) {
      if (normalizeString(name).length > 0)
        ctx.addIssue({ code: "custom", message: "DirectMessage name must be empty", path: ["name"] });
      return;
    }

    const parsedRoomName = roomNameSchema.safeParse(name);
    if (!parsedRoomName.success)
      for (const issue of parsedRoomName.error.issues) ctx.addIssue({ ...issue, path: ["name", ...issue.path] });
  });
