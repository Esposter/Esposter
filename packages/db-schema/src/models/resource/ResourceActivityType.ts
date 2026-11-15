import { z } from "zod";

export const ResourceActivityType = {
  ContentSaved: "ContentSaved",
  Created: "Created",
  Duplicated: "Duplicated",
  Published: "Published",
  Renamed: "Renamed",
  Restored: "Restored",
  Unpublished: "Unpublished",
} as const;
export type ResourceActivityType = (typeof ResourceActivityType)[keyof typeof ResourceActivityType];

export const resourceActivityTypeSchema = z.enum(ResourceActivityType) satisfies z.ZodType<ResourceActivityType>;
