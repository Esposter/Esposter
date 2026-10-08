// A character's set of skills: its skills by their slots, the second of them its elemental skill, and its burst, the
// Energy skill, none where the set has none. Its passives are the dump's obfuscated `LHNAJLJNBAH`, the set's inherent
// Proud skill opens, each with the proud skill group it opens and the ascension phase it opens at, the obfuscated
// `KGGNNMEALJM`, at this dump's revision
export interface ExcelSkillDepotRow {
  energySkill?: number;
  id: number;
  LHNAJLJNBAH?: { KGGNNMEALJM: number; proudSkillGroupId: number }[];
  skills: number[];
}
