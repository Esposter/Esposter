import { BinaryOperator } from "@/models/azure/BinaryOperator";
import { Literal } from "@/models/azure/Literal";
import { UnaryOperator } from "@/models/azure/UnaryOperator";
// https://stackoverflow.com/questions/4228460/querying-azure-table-storage-for-null-values
export const isNull = (key: string): string => `${UnaryOperator.not}(${key} ${BinaryOperator.ne} ${Literal.NaN})`;
