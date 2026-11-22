// The question a trailer's ledger names. `<question>/<area>` is the question, an area being a grouping of its cells
// Rather than a ledger, and any other name is its own ledger
export const getLedgerQuestion = (ledger: string, areas: readonly string[]): string => {
  const separatorIndex = ledger.lastIndexOf("/");
  return separatorIndex !== -1 && areas.includes(ledger.slice(separatorIndex + 1))
    ? ledger.slice(0, separatorIndex)
    : ledger;
};
