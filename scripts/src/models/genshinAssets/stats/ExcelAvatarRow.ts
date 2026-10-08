// One row of the game's character table, of the fields the roster needs
export interface ExcelAvatarRow {
  attackBase: number;
  avatarPromoteId: number;
  bodyType: string;
  chargeEfficiency: number;
  critical: number;
  criticalHurt: number;
  defenseBase: number;
  hpBase: number;
  id: number;
  initialWeapon: number;
  nameTextMapHash: number;
  propGrowCurves: { growCurve: string; type: string }[];
  qualityType: string;
  skillDepotId: number;
  useType: string;
  weaponType: string;
}
