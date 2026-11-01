// A module-scope table's declaration, `name = [][]float64{` or `name = []float64{`
const TABLE_DECLARATION_REGEX = /^\s*(?:var |const )?(?<name>[A-Za-z_]\w*)\s*(?::=|=)\s*\[\]/u;
// The local a use binds to a table's cell, `x` in `x := tbl[i]` or `var x = tbl[i]`
const BOUND_LOCAL_REGEX = /^\s*(?:var\s+)?(?<local>[A-Za-z_]\w*)\s*(?::=|=)(?!=)/u;

// The constructor an area is read from, by the line it is cited at. A table's declaration line is cited by its row, so the
// Constructor is the nearest `combat.New` line above the first use of the table below it, else the first one below that
// Use that reads the local the use binds; any other line is its own
export const readConstructorIndex = (lines: readonly string[], lineIndex: number): number => {
  const name = TABLE_DECLARATION_REGEX.exec(lines[lineIndex] ?? "")?.groups?.name;
  if (name === undefined) return lineIndex;
  const use = lines.findIndex((line, index) => index > lineIndex && line.includes(`${name}[`));
  if (use === -1) return lineIndex;
  let constructor = use;
  while (constructor > lineIndex && !(lines[constructor] ?? "").includes("combat.New")) constructor--;
  if (constructor > lineIndex) return constructor;
  const local = BOUND_LOCAL_REGEX.exec(lines[use] ?? "")?.groups?.local;
  if (local === undefined) return lineIndex;
  const readsLocal = new RegExp(`\\b${local}\\b`, "u");
  const below = lines.findIndex((line, index) => index > use && line.includes("combat.New") && readsLocal.test(line));
  return below === -1 ? lineIndex : below;
};
