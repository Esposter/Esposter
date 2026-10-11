// One row of a wiki talent page's `{{Advanced Properties}}` template: its number on the page, counted across the page's
// Templates, its title, the gauge its `gu` gives in units, its ICD tag as the wiki writes it, its poise and whether it
// Is blunt. A field the row leaves out, or writes as anything but one number, is undefined
export interface WikiAdvancedProperty {
  gauge?: number;
  internalCooldownTag?: string;
  isBlunt?: true;
  poise?: number;
  row: number;
  title: string;
}
