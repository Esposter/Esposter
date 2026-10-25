import type { TreeTube } from "genshin-engine";

export const countPoints = (tubes: readonly TreeTube[]): number => tubes.reduce((sum, tube) => sum + tube.length, 0);
