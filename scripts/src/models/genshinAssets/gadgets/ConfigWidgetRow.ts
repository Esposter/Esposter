// One widget of the game's widget config as the dump gives it: its kind by its type name, whether it can be equipped on Z,
// Its cooldown and its cooldown on a failed use in seconds, and its cooldown group. The config omits what a kind does not
// Use, so each of those fields is absent for some kinds
export interface ConfigWidgetRow {
  $type: string;
  coolDown?: number;
  coolDownGroup?: number;
  coolDownOnFail?: number;
  isEquipable?: boolean;
}
