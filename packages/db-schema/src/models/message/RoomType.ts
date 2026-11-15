import { z } from "zod";

export const RoomType = { DirectMessage: "DirectMessage", Room: "Room" } as const;
export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const roomTypeSchema = z.enum(RoomType) satisfies z.ZodType<RoomType>;
