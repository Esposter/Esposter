// One row of the game's city table, of the fields a city's region and a series' region read: the city's id, its name by
// Text hash and the areas it holds, which are the game's own level-one areas its region is read off
export interface DumpedCity {
  areaIdVec: number[];
  cityId: number;
  cityNameTextMapHash: number;
}
