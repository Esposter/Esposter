import type { ItemEntityType } from "@esposter/shared";

import { PageMarkType } from "#shared/models/app/PageMarkType";
import { selectRoomInMessageSchema } from "@esposter/db-schema";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

// A room's page, marked by the room, whose icon the dock draws from the room icon meaning. The id is the room a bookmark
// Of the page names
export interface RoomPageMark extends ItemEntityType<PageMarkType.Room> {
  id: string;
}

export const roomPageMarkSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(PageMarkType.Room)).shape,
  id: selectRoomInMessageSchema.shape.id,
}) satisfies z.ZodType<RoomPageMark>;
