import { NONE_SOURCE } from "#src/services/constants";

// `'none'` is the empty list and stands alone: a source added beside a default `'none'` replaces it, which a browser would
// Otherwise ignore with a warning, and a consumer's own `['none']` replaces the default sources
export const mergeSources = (defaultSources: boolean | string[] | undefined, sources: string[]): string[] => {
  if (sources.length === 1 && sources[0] === NONE_SOURCE) return sources;

  const mergedSources = new Set([...(Array.isArray(defaultSources) ? defaultSources : []), ...sources]);
  if (mergedSources.size > 1) mergedSources.delete(NONE_SOURCE);
  return [...mergedSources];
};
