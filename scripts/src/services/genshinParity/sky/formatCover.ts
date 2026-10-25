import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

export const formatCover = ({ elevationCoverage }: SkyStatistics): string =>
  elevationCoverage.map((cover) => `${(cover * 100).toFixed(1)}%`).join(", ");
