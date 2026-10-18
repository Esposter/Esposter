import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

// A single hit's own field in `hitFields`, by the name its path holds
const HIT_FIELD_PATH_REGEX = /^hitFields\.(?<name>[^.]+)\./u;

// The names of a record's single hits in `hitFields`, each once, from the paths its candidates and its overlay give
export const getKitHitFieldNames = (candidateMap: ReadonlyMap<string, unknown>, overlay: KitOverlay): string[] => [
  ...new Set(
    [...candidateMap.keys(), ...Object.keys(overlay)].flatMap(
      (path) => HIT_FIELD_PATH_REGEX.exec(path)?.groups?.name ?? [],
    ),
  ),
];
