import type { Manifest } from "#src/models/fleet/data/Manifest";

// The directories of the source whose digest the target lacks or holds differently: the only ones either side lists
export const getChangedDirectories = (source: Manifest, target: Manifest): string[] =>
  Object.keys(source).filter((directory) => target[directory] !== source[directory]);
