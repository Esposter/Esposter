import type { CityArea } from "#src/models/genshinAssets/world/CityArea";

// The city areas one game version's install holds, as `city-areas.json` keeps them beside the exports
export interface CityAreaFile {
  areas: CityArea[];
  candidateCount: number;
  gameVersion: string;
}
