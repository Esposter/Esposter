import { getLedgerArea } from "#src/services/sweeps/ledgerCoverage/getLedgerArea";

// The question a trailer's ledger names. `<question>/<area>` is the question, and any other name is its own ledger
export const getLedgerQuestion = (ledger: string, areas: readonly string[]): string =>
  getLedgerArea(ledger, areas) === undefined ? ledger : ledger.slice(0, ledger.lastIndexOf("/"));
