/* eslint-disable perfectionist/sort-enums */
import { z } from "zod";

export enum FilterType {
  From = "From",
  In = "In",
  Mentions = "Mentions",
  Has = "Has",
  Before = "Before",
  During = "During",
  After = "After",
  Pinned = "Pinned",
}

export const filterTypeSchema = z.enum(FilterType) satisfies z.ZodType<FilterType>;

export const FilterTypes: readonly FilterType[] = Object.values(FilterType);
