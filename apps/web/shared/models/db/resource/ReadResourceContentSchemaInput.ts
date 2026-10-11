import { resourceTypeSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readResourceContentSchemaInputSchema = z.object({ type: resourceTypeSchema });
export type ReadResourceContentSchemaInput = z.infer<typeof readResourceContentSchemaInputSchema>;
