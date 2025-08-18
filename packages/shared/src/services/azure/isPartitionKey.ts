import { BinaryOperator } from "@/models/azure/BinaryOperator";

export const isPartitionKey = (partitionKey: string, operator: BinaryOperator = BinaryOperator.eq): string =>
  `PartitionKey ${operator} '${partitionKey}'`;
