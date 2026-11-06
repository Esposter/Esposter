// A query of only whitespace filters nothing, so it is not a search
export const checkIsPaletteSearching = (query: string): boolean => query.trim() !== "";
