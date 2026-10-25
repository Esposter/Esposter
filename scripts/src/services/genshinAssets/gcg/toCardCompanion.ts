import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";

// A companion support card carries the ally tag the dump marks the Companion Support Cards with, and any other card carries no mark
export const toCardCompanion = ({ tagList }: ExcelGcgCardRow): { isCompanion?: boolean } =>
  tagList.includes("GCG_TAG_ALLY") ? { isCompanion: true } : {};
