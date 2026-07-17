import { z } from "zod";

export enum ResourceActivityType {
  ContentSaved = "ContentSaved",
  Created = "Created",
  Duplicated = "Duplicated",
  Imported = "Imported",
  Published = "Published",
  Renamed = "Renamed",
  Restored = "Restored",
  Unpublished = "Unpublished",
}

export const resourceActivityTypeSchema = z.enum(ResourceActivityType) satisfies z.ZodType<ResourceActivityType>;
