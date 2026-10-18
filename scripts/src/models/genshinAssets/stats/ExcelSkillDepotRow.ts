// A character's set of skills: its skills by their slots, the second of them its elemental skill, and its burst, the
// Energy skill, none where the set has none. Its passives are the dump's obfuscated `LLEFDMDOMGG`, the set's inherent
// Proud skill opens, each with the proud skill group it opens and the ascension phase it opens at, the obfuscated
// `DHIEHDPAFGI`, at this dump's revision. Its constellations are the `talents`, one for each of the six in order, zero where
// The set has none
export interface ExcelSkillDepotRow {
  energySkill?: number;
  id: number;
  LLEFDMDOMGG?: { DHIEHDPAFGI: number; proudSkillGroupId: number }[];
  skills: number[];
  talents?: number[];
}
