// /* eslint-disable perfectionist/sort-enums */
import { z } from "zod";

export enum FilterType {
  From = "From",
  Mentions = "Mentions",
  // Has = "Has",
  // Before = "Before",
  // During = "During",
  // After = "After",
  // Pinned = "Pinned",
  // AuthorType = "AuthorType",
}

export const filterTypeSchema = z.enum(FilterType) satisfies z.ZodType<FilterType>;
