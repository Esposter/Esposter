import type { Clause } from "@esposter/db-schema";

import { applyFilter } from "@/services/filter/applyFilter";
import { getTableNullClause } from "@esposter/db";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(applyFilter, () => {
  const partitionKey = "0";
  const rowKey = "0";
  const documents: Record<string, unknown>[] = [{ partitionKey, rowKey }];

  test(BinaryOperator.eq, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(1);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.eq} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "1" },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(0);
  });

  test(BinaryOperator.gt, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.gt, value: "-1" },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(1);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.gt} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.gt, value: partitionKey },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(0);
  });

  test(BinaryOperator.ge, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.ge, value: partitionKey },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(1);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.ge} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.ge, value: "1" },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(0);
  });

  test(BinaryOperator.lt, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.lt, value: "1" },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(1);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.lt} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.lt, value: partitionKey },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(0);
  });

  test(BinaryOperator.le, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.le, value: partitionKey },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(1);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.le} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.le, value: "-1" },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(0);
  });

  test(BinaryOperator.ne, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.ne, value: "1" },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(1);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.ne} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.ne, value: partitionKey },
    ];
    const filteredDocuments = applyFilter(documents, clauses);

    expect(filteredDocuments).toHaveLength(0);
  });

  test("groups same-key clauses with OR and cross-key clauses with AND", () => {
    expect.hasAssertions();

    const groupedDocuments: Record<string, unknown>[] = [
      { partitionKey, rowKey },
      { partitionKey: "1", rowKey },
      { partitionKey, rowKey: "1" },
      { partitionKey: "2", rowKey },
    ];
    const clauses: Clause<Record<string, unknown>>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey },
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "1" },
      { key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.eq, value: rowKey },
    ];
    const filteredDocuments = applyFilter(groupedDocuments, clauses);

    expect(filteredDocuments).toHaveLength(2);
    expect(takeOne(filteredDocuments).partitionKey).toBe(partitionKey);
    expect(takeOne(filteredDocuments, 1).partitionKey).toBe("1");
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
