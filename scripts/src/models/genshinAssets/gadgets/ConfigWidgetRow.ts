// One widget of the game's widget config as the dump gives it: its kind by its type name, whether it can be equipped on Z,
// Its cooldown and its cooldown on a failed use in seconds, and its cooldown group. The config omits what a kind does not
// Use, so each of those fields is absent for some kinds. A gather point finder names the gather point type it finds, and a
// Treasure compass the city it works in
export interface ConfigWidgetRow {
  $type: string;
  allowCityId?: number;
  coolDown?: number;
  coolDownGroup?: number;
  coolDownOnFail?: number;
  gatherPointType?: number;
  isEquipable?: boolean;
}
