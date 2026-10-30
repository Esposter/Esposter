import { getUiBaseName } from "#src/services/genshinAssets/ui/getUiBaseName";

// Whether a name matches the pattern, either as the export holds it or with its duplicate suffix taken off.
// A pattern naming an object as it was made therefore finds its repeats too.
export const matchesUiName = (name: string, pattern: RegExp): boolean =>
  pattern.test(name) || pattern.test(getUiBaseName(name));
