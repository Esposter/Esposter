// A run of lines that opens and closes a component's wiring, each line between them matching the entry shape
export interface WiringBlock {
  end: RegExp;
  entry: RegExp;
  start: RegExp;
}
