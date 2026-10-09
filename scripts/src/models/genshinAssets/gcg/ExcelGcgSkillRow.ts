// One skill of the card game's skill table, as the dump names its fields. skillJson is the effect's name the duel reads:
// A shared effect such as Effect_Damage_Fire_3, or a card's own script such as Char_Skill_13012
export interface ExcelGcgSkillRow {
  costList: ExcelGcgCostEntry[];
  energyRecharge: number;
  id: number;
  skillJson: string;
  skillTagList: string[];
}
export interface ExcelGcgCostEntry {
  costType: string;
  count: number;
}
