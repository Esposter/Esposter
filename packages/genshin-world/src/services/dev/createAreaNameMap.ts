import type { Catalogue } from "#src/models/world/Catalogue";

// Each area's name by its id, across every region the catalogue holds
export const createAreaNameMap = (catalogue: Catalogue): Map<string, string> =>
  new Map(catalogue.regions.flatMap(({ areas }) => areas.map(({ id, name }) => [id, name] as const)));
