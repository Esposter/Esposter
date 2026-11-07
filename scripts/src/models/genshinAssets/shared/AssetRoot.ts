import { z } from "zod";

// A root a component is exported from: the block holding it, its game object's name, and that game object's path ID,
// Which names it where its name is shared
export interface AssetRoot {
  block: string;
  name: string;
  pathId: string;
}

export const assetRootSchema = z.object({
  block: z.string().min(1),
  name: z.string().min(1),
  pathId: z.string().min(1),
}) satisfies z.ZodType<AssetRoot>;
