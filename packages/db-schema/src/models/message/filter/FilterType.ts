/* eslint-disable perfectionist/sort-objects -- Discord's filter order, which the search menu lists */
import { z } from "zod";

export const FilterType = {
  AuthorType: "AuthorType",
  From: "From",
  In: "In",
  Mentions: "Mentions",
  Has: "Has",
  Before: "Before",
  During: "During",
  After: "After",
  Pinned: "Pinned",
} as const;
export type FilterType = (typeof FilterType)[keyof typeof FilterType];

export const filterTypeSchema = z.enum(FilterType) satisfies z.ZodType<FilterType>;

export const FilterTypes: readonly FilterType[] = Object.values(FilterType);
