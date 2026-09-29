import { z } from "zod";

// A place inside an area as the game names it: a town, a lake, a ruin
export interface CatalogueSubarea {
  id: string;
  name: string;
}

export const catalogueSubareaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
}) satisfies z.ZodType<CatalogueSubarea>;
