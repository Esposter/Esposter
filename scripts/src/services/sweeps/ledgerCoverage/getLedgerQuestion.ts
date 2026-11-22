// The area a `<question>/<area>` ledger names, or undefined for any other name. An area is a grouping of a question's
// Cells rather than a ledger of its own
export const getLedgerArea = (ledger: string, areas: readonly string[]): string | undefined => {
  const separatorIndex = ledger.lastIndexOf("/");
  const area = ledger.slice(separatorIndex + 1);
  return separatorIndex !== -1 && areas.includes(area) ? area : undefined;
};

// The question a trailer's ledger names. `<question>/<area>` is the question, and any other name is its own ledger
export const getLedgerQuestion = (ledger: string, areas: readonly string[]): string =>
  getLedgerArea(ledger, areas) === undefined ? ledger : ledger.slice(0, ledger.lastIndexOf("/"));
