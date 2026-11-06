import { MAX_LAYOUT_ID_LENGTH, MAX_LAYOUT_REGION_COUNT } from "#src/services/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// What a reader has changed of a layout. Each map is keyed by the id of the region it is about, and holds that region's size,
// Whether an on-demand region is open, or the active panel of a tabbed region
export interface ReaderState {
  regionActivePanelIdMap: Record<string, string>;
  regionOpenMap: Record<string, boolean>;
  regionSizeMap: Record<string, number>;
}

const layoutIdSchema = z.string().max(MAX_LAYOUT_ID_LENGTH);

// The stored shape of a reader state. It is read against a layout by the parse, which drops what the layout does not name
export const readerStateSchema: z.ZodObject<{
  regionActivePanelIdMap: z.ZodRecord<z.ZodString, z.ZodString>;
  regionOpenMap: z.ZodRecord<z.ZodString, z.ZodBoolean>;
  regionSizeMap: z.ZodRecord<z.ZodString, z.ZodNumber>;
}> = z.object({
  regionActivePanelIdMap: createRecordSchema(layoutIdSchema, layoutIdSchema, MAX_LAYOUT_REGION_COUNT),
  regionOpenMap: createRecordSchema(layoutIdSchema, z.boolean(), MAX_LAYOUT_REGION_COUNT),
  regionSizeMap: createRecordSchema(layoutIdSchema, z.number().nonnegative(), MAX_LAYOUT_REGION_COUNT),
}) satisfies z.ZodType<ReaderState>;
