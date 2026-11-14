// A reference to another row: the row's column is set to the id of the row it names
export interface TableLink {
  column: string;
  // The id of the row whose column is set
  id: string;
  referenceId: string;
}
