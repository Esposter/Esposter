import type { z } from "zod";

// The document's own half: the types its content accepts and the schema its props pass
export interface BlockRootDefinition {
  content: string[];
  propsSchema: z.ZodObject;
}
