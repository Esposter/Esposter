import type { z } from "zod";

// The document's own half: the types its content accepts and the schema its props pass
export interface BlockRootDefinition<TProps extends Record<string, unknown> = Record<string, unknown>> {
  content: string[];
  propsSchema: z.ZodType<TProps>;
}
