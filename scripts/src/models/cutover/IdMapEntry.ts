import { z } from "zod";

// One Azure entity's id: the keys it is found by, and the random v4 id its typed row carries
export const idMapEntrySchema = z.object({ id: z.uuidv4(), partitionKey: z.string(), rowKey: z.string() });
export type IdMapEntry = z.infer<typeof idMapEntrySchema>;
