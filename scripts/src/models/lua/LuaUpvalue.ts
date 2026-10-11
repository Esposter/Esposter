// Where a closure finds an upvalue when it is created: a register of its parent when in the stack, else an upvalue of it
export interface LuaUpvalue {
  index: number;
  inStack: boolean;
}
