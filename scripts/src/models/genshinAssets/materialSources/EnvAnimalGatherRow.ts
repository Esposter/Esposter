// The fields read off one row of the game's environment animal gather table: the animal it is for and the items it gives
// When picked, each entry of the list a count and an item id, the entries the dump pads a row with holding neither
export interface EnvAnimalGatherRow {
  animalId: number;
  gatherItemList: { count?: number; id?: number }[];
}
