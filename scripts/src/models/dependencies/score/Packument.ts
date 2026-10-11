// The fields of the npm registry's full packument the score reads: when each version was published and which are deprecated
export interface Packument {
  "dist-tags": Record<string, string>;
  time: Record<string, string>;
  versions: Record<string, { deprecated?: string }>;
}
