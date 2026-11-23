// What one file adds to the size of the unit holding it: one file unless it is binary, and its lines when it is code
export interface UnitSize {
  files: number;
  lines: number;
}
