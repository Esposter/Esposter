// A skill, of its cooldown, the charges it holds, the energy it costs and the element that energy is, none where it
// Costs none
export interface ExcelSkillRow {
  cdTime: number;
  costElemType?: string;
  costElemVal: number;
  id: number;
  maxChargeNum: number;
}
