// How a form schema's field is drawn beyond what its type says: text over several lines, or a choice among items the
// Form's dialog hands it under a key of its context — the columns of the sheet a transformation reads from
export interface SchemaFormLayout {
  isMultiline?: true;
  itemsKey?: string;
}
