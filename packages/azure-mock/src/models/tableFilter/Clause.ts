import type { ComparisonOperator } from "@/models/tableFilter/ComparisonOperator";

export interface Clause {
  key: string;
  operator: ComparisonOperator;
  value: string;
}
