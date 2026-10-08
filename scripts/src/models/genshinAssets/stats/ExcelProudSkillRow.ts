// One level of a proud skill, a combat talent's or a passive's: the ascension phase the level needs, and the Mora and the
// Items it costs, each cost slot holding nothing left as its id and count of zero
export interface ExcelProudSkillRow {
  breakLevel: number;
  coinCost: number;
  costItems: { count: number; id: number }[];
  level: number;
  proudSkillGroupId: number;
}
