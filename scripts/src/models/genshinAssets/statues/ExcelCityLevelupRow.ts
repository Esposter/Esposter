// One action a statue level grants, the stamina a level adds among them being `WORLD_AREA_ACTION_IMPROVE_STAMINA`
export interface ExcelCityLevelupAction {
  param1Vec: number[];
  param2Vec: number[];
  type: string;
}

// One level of a region's statues: the Oculi it takes, a count the dump names by an obfuscated key, and the reward row
// Its actions and reward are read from. Level 1 takes none
export interface ExcelCityLevelupRow {
  actionVec: ExcelCityLevelupAction[];
  cityId: number;
  consumeItem: { EBHHDLDJNHI: number; itemId: number };
  level: number;
  rewardID: number;
  sceneId: number;
}
