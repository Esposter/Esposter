export const normalizeLedgerUnit = (unit: string): string => unit.replaceAll("`", "").trim();
