// One row of a wiki talent page's `{{Advanced Properties}}` template: its number on the page, counted across the page's
// Templates, its title, the gauge its `gu` gives in units, its ICD tag as the wiki writes it, its poise and whether it
// Is blunt. A field the row leaves out is undefined, and so is a gauge or poise the row does not write as a number; the
// ICD tag is the wiki's text, and isBlunt is set only where the row says it is blunt
export interface WikiAdvancedProperty {
  gauge?: number;
  internalCooldownTag?: string;
  isBlunt?: true;
  poise?: number;
  row: number;
  title: string;
}
