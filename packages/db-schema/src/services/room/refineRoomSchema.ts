import { createNameSchema } from "#src/models/shared/Name";
import { ROOM_NAME_MAX_LENGTH, RoomType } from "#src/schema/roomsInMessage";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

const roomNameSchema = createNameSchema(ROOM_NAME_MAX_LENGTH);

export const refineRoomSchema = <TSchema extends z.ZodType>(schema: TSchema, roomType = RoomType.Room): TSchema =>
  schema.superRefine((data, ctx) => {
    const { name, type } = data as Partial<{ name: string; type: RoomType }>;
    if (name === undefined) return;

    if ((type ?? roomType) === RoomType.DirectMessage) {
      if (normalizeString(name).length > 0)
        ctx.addIssue({ code: "custom", message: "DirectMessage name must be empty", path: ["name"] });
      return;
    }

    const result = roomNameSchema.safeParse(name);
    if (!result.success)
      for (const issue of result.error.issues) ctx.addIssue({ ...issue, path: ["name", ...issue.path] });
  });
