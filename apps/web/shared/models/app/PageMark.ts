import type { ResourcePageMark } from "#shared/models/app/ResourcePageMark";

import { resourcePageMarkSchema } from "#shared/models/app/ResourcePageMark";
import { z } from "zod";

// The kind of thing a page is, which the page declares while it is mounted and a place keeps. Data rather than an
// Icon class, so the icon follows its map and the server can refuse a mark outside the union
export type PageMark = ResourcePageMark;

export const pageMarkSchema = z.discriminatedUnion("type", [resourcePageMarkSchema]) satisfies z.ZodType<PageMark>;
