import { z } from "zod";

export const FilterTypeAuthorType = { User: "User", Webhook: "Webhook" } as const;
export type FilterTypeAuthorType = (typeof FilterTypeAuthorType)[keyof typeof FilterTypeAuthorType];

export const filterTypeAuthorTypeSchema = z.enum(FilterTypeAuthorType) satisfies z.ZodType<FilterTypeAuthorType>;

export const FilterTypeAuthorTypes: readonly FilterTypeAuthorType[] = Object.values(FilterTypeAuthorType);
