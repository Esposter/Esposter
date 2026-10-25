// One condition a story's open or finish list names, as the dump writes it: its kind, which the dump leaves out when the kind
// Is none, the enum's first value, and the numbers it is read with
export interface ExcelFetterCondition {
  condType?: string;
  paramList: number[];
}
