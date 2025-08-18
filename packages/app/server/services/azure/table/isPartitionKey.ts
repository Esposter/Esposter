import { BinaryOperator } from "@esposter/shared";

export const isPartitionKey = (partitionKey: string) => `PartitionKey ${BinaryOperator.eq} '${partitionKey}'`;
