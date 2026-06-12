import type { Clause } from "@esposter/db-schema";

import { applyFilter } from "@/services/filter/applyFilter";
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
});
