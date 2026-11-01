// An item of the game's material table, of which only its kind and icon are read: a namecard is the one kind a character
// Card's reward holds that is named by its icon
export interface ExcelNamecardMaterialRow {
  icon?: string;
  id: number;
  materialType?: string;
}
