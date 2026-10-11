import type { TowerSlab } from "#src/models/login/TowerSlab";

import { z } from "zod";

// The login's towers: each facade by its tower's name, and every instance the scene stands
export interface LoginTowers {
  facades: Record<string, LoginTowerFacadeData>;
  placements: LoginTowerPlacement[];
}
// A band of a tower's facade: the height it runs from and to, and the shade its stone is painted in there
interface LoginTowerBand {
  from: number;
  shade: number[];
  to: number;
}
// One tower's facade as its fit traced it: its bands, layers, holes, columns, recesses, sections and size
interface LoginTowerFacadeData {
  bands: LoginTowerBand[];
  columns: TowerSlab[];
  holes: number[][][];
  layers: LoginTowerLayer[];
  recesses: TowerSlab[];
  sections: LoginTowerSection[];
  size: number[];
}
// A layer of a tower's facade: its loops and the shade they are painted in
interface LoginTowerLayer {
  loops: number[][][];
  shade: number[];
}
// One instance of a tower: where it stands, its turn as a quaternion, its scale and the facade it is of
interface LoginTowerPlacement {
  position: number[];
  rotation: number[];
  scale: number;
  tower: string;
}
// A section of a tower's lathe, from its bottom radius to its top one over its height
interface LoginTowerSection {
  bottomRadius: number;
  height: number;
  topRadius: number;
}

// A slab of a tower's wall: six numbers, as `TowerSlab` holds them
const towerSlabSchema = z.array(z.number()).length(6) satisfies z.ZodType<TowerSlab>;
const loginTowerBandSchema = z.object({
  from: z.number(),
  shade: z.array(z.number()).length(3),
  to: z.number(),
}) satisfies z.ZodType<LoginTowerBand>;
const loginTowerLayerSchema = z.object({
  loops: z.array(z.array(z.array(z.number()).length(2))),
  shade: z.array(z.number()).length(3),
}) satisfies z.ZodType<LoginTowerLayer>;
const loginTowerSectionSchema = z.object({
  bottomRadius: z.number().nonnegative(),
  height: z.number().positive(),
  topRadius: z.number().nonnegative(),
}) satisfies z.ZodType<LoginTowerSection>;
const loginTowerFacadeDataSchema = z.object({
  bands: z.array(loginTowerBandSchema),
  columns: z.array(towerSlabSchema),
  holes: z.array(z.array(z.array(z.number()).length(2))),
  layers: z.array(loginTowerLayerSchema),
  recesses: z.array(towerSlabSchema),
  sections: z.array(loginTowerSectionSchema),
  size: z.array(z.number()).length(2),
}) satisfies z.ZodType<LoginTowerFacadeData>;
const loginTowerPlacementSchema = z.object({
  position: z.array(z.number()).length(3),
  rotation: z.array(z.number()).length(4),
  scale: z.number().positive(),
  tower: z.string().nonempty(),
}) satisfies z.ZodType<LoginTowerPlacement>;

export const loginTowersSchema = z.object({
  facades: z.record(z.string(), loginTowerFacadeDataSchema),
  placements: z.array(loginTowerPlacementSchema),
}) satisfies z.ZodType<LoginTowers>;
