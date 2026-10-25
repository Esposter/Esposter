import { mixFinal } from "#src/services/genshinAssets/fit/mixFinal";

const HASH_SEED = 0xdeadbeef + 3 * 4 + 13;

export const hashLatticePoint = (x: number, y: number, z: number): number =>
  mixFinal((HASH_SEED + x) >>> 0, (HASH_SEED + y) >>> 0, (HASH_SEED + z) >>> 0);
