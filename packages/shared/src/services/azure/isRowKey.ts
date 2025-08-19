import { BinaryOperator } from "@/models/azure/BinaryOperator";

export const isRowKey = (rowKey: string) => `RowKey ${BinaryOperator.eq} '${rowKey}'`;
