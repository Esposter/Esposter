// A skill, of its cooldown, the charges it holds, the energy it costs, the element that energy is, none where it costs
// None, and the proud skill group of the combat talent it is, zero where it is none
export interface ExcelSkillRow {
  cdTime: number;
  costElemType?: string;
  costElemVal: number;
  id: number;
  maxChargeNum: number;
  proudSkillGroupId?: number;
}
