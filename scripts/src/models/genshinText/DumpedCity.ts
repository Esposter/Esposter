// One row of the game's city table, of the fields a series' region reads: the city's id and its name by text hash
export interface DumpedCity {
  cityId: number;
  cityNameTextMapHash: number;
}
