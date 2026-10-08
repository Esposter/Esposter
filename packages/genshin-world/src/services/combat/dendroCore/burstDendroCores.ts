import type { DendroCore } from "#src/models/combat/DendroCore";

import { DENDRO_CORE_LIFETIME_SECONDS, MAX_DENDRO_CORE_COUNT } from "#src/services/combat/dendroCore/constants";

// The Dendro Cores that burst at a moment, taken in place from those on the field, which stand oldest first: every core
// Past the five newest, and every core its lifetime old
export const burstDendroCores = <T extends DendroCore>(dendroCores: T[], seconds: number): T[] => {
  const overflowCount = Math.max(dendroCores.length - MAX_DENDRO_CORE_COUNT, 0);
  const burstingDendroCores = dendroCores.filter(
    ({ spawnSeconds }, index) => index < overflowCount || seconds - spawnSeconds >= DENDRO_CORE_LIFETIME_SECONDS,
  );
  const keptDendroCores = dendroCores.filter((dendroCore) => !burstingDendroCores.includes(dendroCore));
  dendroCores.length = 0;
  dendroCores.push(...keptDendroCores);
  return burstingDendroCores;
};
