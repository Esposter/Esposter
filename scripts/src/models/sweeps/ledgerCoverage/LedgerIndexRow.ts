// One row of the ledgers index: a ledger, and the git pathspecs its `Scope` cell backticks
export interface LedgerIndexRow {
  ledger: string;
  pathspecs: string[];
}
