// A character's set of skills: its skills by their slots, the second of them its elemental skill, and its burst, the
// Energy skill, none where the set has none
export interface ExcelSkillDepotRow {
  energySkill?: number;
  id: number;
  skills: number[];
}
