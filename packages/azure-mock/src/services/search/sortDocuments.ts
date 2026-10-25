import { compareValues } from "#src/services/search/compareValues";
import { deserializeKey } from "@esposter/azure";

export const sortDocuments = (documents: Record<string, unknown>[], orderBy: string[]): Record<string, unknown>[] => {
  // Parsed once rather than inside the comparator, which runs O(n log n) times
  const parsedOrderBy = orderBy.map((clause) => {
    const [field = "", direction = "asc"] = clause.split(/\s+/u);
    return { direction, key: deserializeKey(field) };
  });
  return documents.toSorted((firstDocument, secondDocument) => {
    for (const { direction, key } of parsedOrderBy) {
      const comparison = compareValues(firstDocument[key], secondDocument[key]);
      if (comparison !== 0) return direction === "desc" ? -comparison : comparison;
    }
    return 0;
  });
};
