// An identifier of an operand: a field when a `.` precedes it, else a bare name not inside a longer word
const OPERAND_NAME_REGEX = /(?:(?<dot>\.)|(?<![\w.]))(?<name>[A-Za-z_]\w*)(?!\w)/gu;

// The names an operand's `+ travel` lands on: its bare identifiers, and for a struct field the root of each value its
// Body sets that field to. An index is no name, `aimedHitmarks[hold]` gives `aimedHitmarks`, and a base before a `.` is
// No name either, `a` in `a.CanQueueAfter`
export const readOperandNames = (operand: string, fieldValueMap: ReadonlyMap<string, string[]>): string[] => {
  const flatOperand = operand.replaceAll(/\[[^\]]*\]/gu, "");
  return [...flatOperand.matchAll(OPERAND_NAME_REGEX)].flatMap(({ groups, index }): string[] => {
    if (groups?.name === undefined) return [];
    if (groups.dot !== undefined) return fieldValueMap.get(groups.name) ?? [];
    return flatOperand[index + groups.name.length] === "." ? [] : [groups.name];
  });
};
