// One condition of a blossom refresh row, its type and the parameters it reads, the dump's own field names kept
export interface ExcelBlossomRefreshCondition {
  param: number[];
  // Absent on an entry the table leaves at its default kind, which the dump writes as an empty object
  type?: string;
}
