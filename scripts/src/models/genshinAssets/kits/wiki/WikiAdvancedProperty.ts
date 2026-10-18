// One row of a wiki talent page's `{{Advanced Properties}}` template: its number on the page, counted across the page's
// Templates, its title, the gauge its `gu` gives in units, its ICD tag as the wiki writes it and its poise. A field the row
// Leaves out is undefined, and so is a gauge or poise the row does not write as a number; the ICD tag is the wiki's text
export interface WikiAdvancedProperty {
  gauge?: number;
  internalCooldownTag?: string;
  poise?: number;
  row: number;
  title: string;
}
