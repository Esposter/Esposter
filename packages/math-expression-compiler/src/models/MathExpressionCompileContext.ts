// What the compiler looks a name up in: the slot of each assigned name, and the index of each variable
export interface MathExpressionCompileContext {
  assignedSlots: ReadonlyMap<string, number>;
  variableIndices: ReadonlyMap<string, number>;
}
