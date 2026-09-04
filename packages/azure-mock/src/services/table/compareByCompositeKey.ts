import type { TableEntity } from "@azure/data-tables";

// Azure Table Storage returns entities ordered by partitionKey then rowKey, comparing each as a
// Case-sensitive ordinal string — which is exactly what the JS < / > operators do on UTF-16 code units,
// So never localeCompare here (locale rules would reorder the reverse-ticked numeric rowKeys).
export const compareByCompositeKey = (firstEntity: TableEntity, secondEntity: TableEntity): number => {
  if (firstEntity.partitionKey !== secondEntity.partitionKey)
    return firstEntity.partitionKey < secondEntity.partitionKey ? -1 : 1;
  else if (firstEntity.rowKey === secondEntity.rowKey) return 0;
  else return firstEntity.rowKey < secondEntity.rowKey ? -1 : 1;
};
