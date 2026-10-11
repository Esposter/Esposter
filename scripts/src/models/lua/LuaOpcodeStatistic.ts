// One dialect opcode number's operand statistics over every instruction of a chunk, read without any mapping: each
// Range is the least and greatest value its field takes, and the counts are the occurrences that meet a condition
export interface LuaOpcodeStatistic {
  aMax: number;
  aMin: number;
  bMax: number;
  bMin: number;
  bxBelowConstantsCount: number;
  bxMax: number;
  bxMin: number;
  cMax: number;
  cMin: number;
  count: number;
  lastInFunctionCount: number;
  // The opcode of the next instruction in the same function that names the same A, within a short window, by count
  nextSameAOpcodes: Record<number, number>;
  opcode: number;
  rkBCount: number;
  rkCCount: number;
}
