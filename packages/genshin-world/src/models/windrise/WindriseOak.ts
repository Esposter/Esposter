import type { TreeCluster, TreeNormalField, TreeOptions, TreeRootPoint, TreeTrunkPoint } from "genshin-engine";

import { z } from "zod";

// The oak as the Windrise fit traced it: the leaf clusters its cards are grown about, the normals of its leaves, its
// Surface roots and its trunk, which are the parts of the engine's tree options the oak takes
export type WindriseOak = Pick<TreeOptions, "clusters" | "normalField" | "roots" | "trunk">;

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
const treeRootPointSchema = z.object({
  radius: z.number().nonnegative(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
}) satisfies z.ZodType<TreeRootPoint>;
const treeTrunkPointSchema = z.object({
  height: z.number().nonnegative(),
  radius: z.number().nonnegative(),
}) satisfies z.ZodType<TreeTrunkPoint>;

export const windriseOakSchema = z.object({
  clusters: z.array(treeClusterSchema),
  normalField: treeNormalFieldSchema,
  roots: z.array(z.tuple([treeRootPointSchema, treeRootPointSchema]).rest(treeRootPointSchema)),
  trunk: z.tuple([treeTrunkPointSchema, treeTrunkPointSchema]).rest(treeTrunkPointSchema),
}) satisfies z.ZodType<WindriseOak>;
