// What the reader is doing: the mode and tool in hand, what is selected and how many things are. The selection kind is "" when nothing is selected
export interface Context {
  mode: string;
  selectionCount: number;
  selectionKind: string;
  tool: string;
}
