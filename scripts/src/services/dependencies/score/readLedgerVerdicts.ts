// A ledger row is `| \`<package>\` | <swept> | <verdict> | <reason> |`, so the package is the backticked first cell
const LEDGER_ROW_REGEX = /^\|\s*`(?<packageName>[^`]+)`\s*\|[^|\n]*\|\s*(?<verdict>[^|\n]+?)\s*\|/gmu;

// Every judged package's verdict cell, as the ledger writes it. The header and separator rows carry no backticked name
export const readLedgerVerdicts = (ledger: string): Map<string, string> => {
  const packageNameVerdictMap = new Map<string, string>();

  for (const { groups } of ledger.matchAll(LEDGER_ROW_REGEX))
    if (groups?.packageName && groups.verdict) packageNameVerdictMap.set(groups.packageName, groups.verdict);

  return packageNameVerdictMap;
};
