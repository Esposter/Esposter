import { createNameSchema } from "@/models/shared/Name";
import { ROOM_NAME_MAX_LENGTH, RoomType } from "@/schema/roomsInMessage";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export const refineRoomSchema = <TSchema extends z.ZodType>(schema: TSchema, roomType = RoomType.Room): TSchema =>
  schema.superRefine((data, ctx) => {
    const { name, type } = data as Partial<{ name: string; type: RoomType }>;
    if (name === undefined) return;

    if ((type ?? roomType) === RoomType.DirectMessage) {
      if (normalizeString(name).length > 0)
        ctx.addIssue({ code: "custom", message: "DirectMessage name must be empty", path: ["name"] });
      return;
    }

    const result = createNameSchema(ROOM_NAME_MAX_LENGTH).safeParse(name);
    if (!result.success)
      for (const issue of result.error.issues) ctx.addIssue({ ...issue, path: ["name", ...issue.path] });
  });
