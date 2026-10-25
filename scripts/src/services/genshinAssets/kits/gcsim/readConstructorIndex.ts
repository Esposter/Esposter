// A module-scope table's declaration, `name = [][]float64{` or `name = []float64{`
const TABLE_DECLARATION_REGEX = /^\s*(?:var |const )?(?<name>[A-Za-z_]\w*)\s*(?::=|=)\s*\[\]/u;

// The constructor an area is read from, by the line it is cited at. A table's declaration line is cited by its row, so the
// Constructor is the nearest `combat.New` line above the first use of the table below it; any other line is its own
export const readConstructorIndex = (lines: readonly string[], lineIndex: number): number => {
  const name = TABLE_DECLARATION_REGEX.exec(lines[lineIndex] ?? "")?.groups?.name;
  if (name === undefined) return lineIndex;
  const use = lines.findIndex((line, index) => index > lineIndex && line.includes(`${name}[`));
  if (use === -1) return lineIndex;
  let constructor = use;
  while (constructor > lineIndex && !(lines[constructor] ?? "").includes("combat.New")) constructor--;
  return constructor > lineIndex ? constructor : lineIndex;
};
