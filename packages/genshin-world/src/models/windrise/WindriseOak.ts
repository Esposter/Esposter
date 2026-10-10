import type { TreeCluster, TreeNormalField, TreeOptions, TreeTubePoint } from "genshin-engine";

import { z } from "zod";

// The oak as the Windrise fit traced it: the leaf clusters its cards are grown about, its trunk and limbs, the normals of
// Its leaves and its surface roots, which are the parts of the engine's tree options the oak takes
export type WindriseOak = Pick<TreeOptions, "clusters" | "limbs" | "normalField" | "roots">;

const treeClusterSchema = z.object({
  leafArea: z.number().positive(),
  radius: z.number().nonnegative(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
}) satisfies z.ZodType<TreeCluster>;
// The normals as a field over the crown, read trilinearly at each card vertex, its corner, cell size and node counts
const treeNormalFieldSchema = z.object({
  cellSize: z.number().positive(),
  normals: z.array(z.number()),
  origin: z.array(z.number()).length(3),
  size: z.array(z.int().positive()).length(3),
}) satisfies z.ZodType<TreeNormalField>;
const treeTubePointSchema = z.object({
  radius: z.number().nonnegative(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
}) satisfies z.ZodType<TreeTubePoint>;
const treeTubeSchema = z.tuple([treeTubePointSchema, treeTubePointSchema]).rest(treeTubePointSchema);

export const windriseOakSchema = z.object({
  clusters: z.array(treeClusterSchema),
  limbs: z.array(treeTubeSchema),
  normalField: treeNormalFieldSchema,
  roots: z.array(treeTubeSchema),
}) satisfies z.ZodType<WindriseOak>;
