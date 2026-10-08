// One tier of a minor affix a depot holds: the group a minor affix's tiers share, and the value of this one
export interface ExcelReliquaryAffixRow {
  depotId: number;
  groupId: number;
  id: number;
  propType: string;
  propValue: number;
}
