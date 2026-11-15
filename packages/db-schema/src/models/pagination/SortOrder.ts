import { z } from "zod";

export const SortOrder = { Asc: "asc", Desc: "desc" } as const;
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export const sortOrderSchema = z.enum(SortOrder) satisfies z.ZodType<SortOrder>;
