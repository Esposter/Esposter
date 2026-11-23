// A ban as a configuration writes it: the selector an AST node must match, and the message reported at that node
export interface SelectorBan {
  message: string;
  selector: string;
}
