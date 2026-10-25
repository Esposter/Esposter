export const toPendingRow = (referenceId: string, screen: string, reason: string): string =>
  `| \`${referenceId}\` | \`${screen}\` | pending: ${reason} | | | |`;
