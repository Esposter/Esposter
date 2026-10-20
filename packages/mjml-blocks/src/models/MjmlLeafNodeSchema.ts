import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { z } from "zod";

// The schema of a consumer's leaf node, one per leaf: its props parsed as that leaf's own, and its type tag that leaf's literal, so a slot's union can discriminate it
export type MjmlLeafNodeSchema<TLeafNode extends MjmlLeafNode = MjmlLeafNode> = TLeafNode extends MjmlLeafNode
  ? z.ZodObject<{ props: z.ZodType<TLeafNode["props"]>; type: z.ZodLiteral<TLeafNode["type"]> }>
  : never;
