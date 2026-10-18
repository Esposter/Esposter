// A named function or method of a file, by its name and the position of that name, and the positions its body opens and
// Closes at
export interface GoNamedFunction {
  bodyEnd: number;
  bodyStart: number;
  name: string;
  nameIndex: number;
  parameters: string[];
}
