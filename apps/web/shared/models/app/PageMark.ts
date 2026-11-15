import type { ResourcePageMark } from "#shared/models/app/ResourcePageMark";
import type { RoomPageMark } from "#shared/models/app/RoomPageMark";

import { resourcePageMarkSchema } from "#shared/models/app/ResourcePageMark";
import { roomPageMarkSchema } from "#shared/models/app/RoomPageMark";
import { z } from "zod";

// The kind of thing a page is, which the page declares while it is mounted and a place keeps. Data rather than an
// Icon class, so the icon follows its map and the server can refuse a mark outside the union
export type PageMark = ResourcePageMark | RoomPageMark;

export const pageMarkSchema = z.discriminatedUnion("type", [
  resourcePageMarkSchema,
  roomPageMarkSchema,
]) satisfies z.ZodType<PageMark>;
