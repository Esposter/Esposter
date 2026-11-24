// One level of a proud skill, a combat talent's or a passive's: the ascension phase the level needs, and the Mora and
// The items it costs, each cost slot holding nothing left as its id and count of zero. Its multipliers are the
// Parameters the level's description is written with, each labelled by the text id its paramDescList names beside it.
// Its name is the text id a passive's first level names it by
export interface ExcelProudSkillRow {
  breakLevel: number;
  coinCost: number;
  costItems: { count: number; id: number }[];
  descTextMapHash: number;
  level: number;
  nameTextMapHash: number;
  paramDescList: number[];
  paramList: number[];
  proudSkillGroupId: number;
}
