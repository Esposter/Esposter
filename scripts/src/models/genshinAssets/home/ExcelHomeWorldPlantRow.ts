// The fields read off one row of the game's garden plant table: the field the seed is planted in, the seed's item, and the
// Seconds it takes to ripen from planting
export interface ExcelHomeWorldPlantRow {
  fieldID: number;
  seedID: number;
  time: number;
}
