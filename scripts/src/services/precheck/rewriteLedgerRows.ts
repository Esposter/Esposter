// A ledger's text with each row whose unit cell names a key of `successors` naming its value instead, the rest of the row
// Kept. The cell is matched as the row spells it, so a line outside a table, or a row naming another unit, is untouched
export const rewriteLedgerRows = (text: string, successors: ReadonlyMap<string, string>): string =>
  text
    .split("\n")
    .map((line) => {
      const [, unitCell] = line.split("|");
      if (!line.startsWith("|") || unitCell === undefined) return line;
      const successor = successors.get(unitCell.trim());
      return successor === undefined ? line : line.replace(unitCell, () => ` ${successor} `);
    })
    .join("\n");
