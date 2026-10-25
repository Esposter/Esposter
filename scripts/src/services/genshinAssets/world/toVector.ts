import type { DumpedVector } from "#src/models/genshinAssets/world/DumpedVector";

export const toVector = ({ x = 0, y = 0, z = 0 }: DumpedVector): [number, number, number] => [x, y, z];
