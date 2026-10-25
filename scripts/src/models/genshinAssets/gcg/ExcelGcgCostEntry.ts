// One cost line of a skill or a card. An empty slot leaves its type out, the table's default, which is the invalid cost
export interface ExcelGcgCostEntry {
  costType?: string;
  count: number;
}
