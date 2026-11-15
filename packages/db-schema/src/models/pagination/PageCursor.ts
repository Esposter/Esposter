import { z } from "zod";

// Where a read continues from: the sort values of the last row it answered, in the sort's key order, and whether it reads
// Backward through the list from there. No values is the start of the list
export interface PageCursor {
  isBackward: boolean;
  values: (number | string)[];
}

export const START_PAGE_CURSOR: PageCursor = { isBackward: false, values: [] };

export const pageCursorSchema = z.object({
  isBackward: z.boolean(),
  values: z.array(z.union([z.number(), z.string()])),
}) satisfies z.ZodType<PageCursor>;
