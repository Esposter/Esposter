import { BinaryOperator } from "@esposter/shared";

export const isRowKey = (rowKey: string) => `RowKey ${BinaryOperator.eq} '${rowKey}'`;
