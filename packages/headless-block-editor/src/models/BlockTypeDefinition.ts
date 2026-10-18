import type { z } from "zod";

// One entry of a consumer's registry: the props a node of this type holds besides its id and slots, and for each slot the child types it allows
export interface BlockTypeDefinition {
  propsSchema: z.ZodObject;
  slots: Record<string, string[]>;
  type: string;
}
