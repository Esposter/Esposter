import type { Clause } from "@esposter/azure";

import { applyFilter } from "#src/services/filter/applyFilter";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { getTableNullClause } from "@esposter/db";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(applyFilter, () => {
  const partitionKey = "0";
  const rowKey = "0";
  const documents: Record<string, unknown>[] = [{ partitionKey, rowKey }];

  // Both directions of every operator against the one document's partitionKey of "0": the value that matches and
  // The value that does not. Serializing and re-parsing the clause is part of what this exercises, so the operator
  // Matrix belongs here rather than on `compare`
  test.each([
    [BinaryOperator.eq, partitionKey, "1"],
    [BinaryOperator.gt, "-1", partitionKey],
    [BinaryOperator.ge, partitionKey, "1"],
    [BinaryOperator.lt, "1", partitionKey],
    [BinaryOperator.le, partitionKey, "-1"],
    [BinaryOperator.ne, "1", partitionKey],
  ])("%s keeps a document it matches and drops one it does not", (operator, matching, nonMatching) => {
    expect.hasAssertions();

    const createClauses = (value: string): Clause<Record<string, unknown>>[] => [
      { key: CompositeKeyPropertyNames.partitionKey, operator, value },
    ];
    const filteredDocuments = applyFilter(documents, createClauses(matching));

    expect(filteredDocuments).toHaveLength(1);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
    expect(applyFilter(documents, createClauses(nonMatching))).toHaveLength(0);
  });

  test("matches null clauses against null and missing values", () => {
    expect.hasAssertions();

    const deletedAtKey = "deletedAt";
    const documentsWithDeletedAt: Record<string, unknown>[] = [
      { [deletedAtKey]: null, partitionKey, rowKey },
      { partitionKey, rowKey: "1" },
      { [deletedAtKey]: "", partitionKey, rowKey: "2" },
    ];
    const filteredDocuments = applyFilter(documentsWithDeletedAt, [getTableNullClause(deletedAtKey)]);

    expect(filteredDocuments).toHaveLength(2);
    expect(takeOne(filteredDocuments).rowKey).toBe(rowKey);
    expect(takeOne(filteredDocuments, 1).rowKey).toBe("1");
  });
});
