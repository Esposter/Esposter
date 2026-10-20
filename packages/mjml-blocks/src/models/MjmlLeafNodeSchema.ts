import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { z } from "zod";

// The schema of a consumer's leaf node: its props parsed as the leaf's own, and its type tag a literal, so a slot's union can discriminate it
export type MjmlLeafNodeSchema = z.ZodObject<{
  props: z.ZodType<MjmlLeafNode["props"]>;
  type: z.ZodLiteral<MjmlLeafNode["type"]>;
}>;
