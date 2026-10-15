import { z } from "zod";

export enum FilterTypeAuthorType {
  User = "User",
  Webhook = "Webhook",
}

export const filterTypeAuthorTypeSchema = z.enum(FilterTypeAuthorType) satisfies z.ZodType<FilterTypeAuthorType>;

export const FilterTypeAuthorTypes: readonly FilterTypeAuthorType[] = Object.values(FilterTypeAuthorType);
