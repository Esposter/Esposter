import { RoomType } from "@/schema/roomsInMessage";
import { refineRoomSchema } from "@/services/room/refineRoomSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(refineRoomSchema, () => {
  const name = "name";

  test("refines", () => {
    expect.hasAssertions();

    const schema = refineRoomSchema(
      z.object({
        name: z.string().optional(),
        type: z.enum(RoomType).optional(),
      }),
    );
    const directMessageSchema = refineRoomSchema(z.object({ name: z.string().optional() }), RoomType.DirectMessage);

    expect(schema.safeParse({ name }).success).toBe(true);
    expect(schema.safeParse({ name: "" }).success).toBe(false);
    expect(schema.safeParse({ name, type: RoomType.DirectMessage }).success).toBe(false);
    expect(schema.safeParse({ name: "", type: RoomType.DirectMessage }).success).toBe(true);
    expect(directMessageSchema.safeParse({ name: "" }).success).toBe(true);
    expect(directMessageSchema.safeParse({ name }).success).toBe(false);
  });
});
