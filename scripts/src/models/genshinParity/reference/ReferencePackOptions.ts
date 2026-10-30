// What a `references pack` run is told about collisions: the ids whose local bytes replace their committed rows.
// It also says whether the collisions it was not told to replace are left out rather than failing the run
export interface ReferencePackOptions {
  replace: string[];
  skipColliding: boolean;
}
