import type { EnemyCamp } from "genshin-world";

// A region's data with its camps replaced by the given ones, every other field kept as it was
export const replaceEnemyCamps = <Data extends object>(
  data: Data,
  enemyCamps: EnemyCamp[],
): Data & { enemyCamps: EnemyCamp[] } => ({ ...data, enemyCamps });
