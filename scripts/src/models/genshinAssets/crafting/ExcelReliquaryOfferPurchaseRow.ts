// One row of the game's reliquary offer table: the set it is an offer for, linked by its param under an obfuscated key the
// Dump renamed at 7.1, and the five-star pieces it lists as per-slot pairs under further obfuscated keys. The pairs are read
// By their shape and not by their key, so a further rename does not break the read
export interface ExcelReliquaryOfferPurchaseRow {
  EPLFOBEBPPG: number;
  id: number;
  [key: string]: unknown;
}
