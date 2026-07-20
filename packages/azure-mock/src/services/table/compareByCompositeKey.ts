import type { TableEntity } from "@azure/data-tables";

// Azure Table Storage returns entities ordered by partitionKey then rowKey, comparing each as a
// Case-sensitive ordinal string — which is exactly what the JS < / > operators do on UTF-16 code units,
// So never localeCompare here (locale rules would reorder the reverse-ticked numeric rowKeys).
export const compareByCompositeKey = (a: TableEntity, b: TableEntity): number => {
  if (a.partitionKey !== b.partitionKey) return a.partitionKey < b.partitionKey ? -1 : 1;
  else if (a.rowKey === b.rowKey) return 0;
  else return a.rowKey < b.rowKey ? -1 : 1;
};
