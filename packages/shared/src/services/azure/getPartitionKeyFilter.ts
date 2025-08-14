import { BinaryOperator } from "@/models/azure/BinaryOperator";

export const getPartitionKeyFilter = (partitionKey: string, operator: BinaryOperator = BinaryOperator.eq): string =>
  `PartitionKey ${operator} '${partitionKey}'`;
