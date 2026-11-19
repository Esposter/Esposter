// One ledger file as the working tree holds it: the ledger it is named by in trailers, its path and its text
export interface LedgerFile {
  ledger: string;
  ledgerPath: string;
  text: string;
}
