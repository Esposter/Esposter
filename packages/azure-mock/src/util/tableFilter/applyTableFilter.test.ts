import type { TableEntity } from "@azure/data-tables";
import type { Clause } from "@esposter/shared";

import { applyTableFilter } from "@/util/tableFilter/applyTableFilter";
import { BinaryOperator, escapeValue, getPropertyNames } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TableEntityPropertyNames = getPropertyNames<TableEntity>();

describe(applyTableFilter, () => {
  const partitionKey = "0";
  const rowKey = "0";
  const tableEntities: TableEntity[] = [{ partitionKey, rowKey }];

  test(BinaryOperator.eq, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.eq,
        value: escapeValue(partitionKey),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.eq} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.eq,
        value: escapeValue("1"),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(0);
  });

  test(BinaryOperator.gt, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.gt,
        value: escapeValue("-1"),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.gt} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.gt,
        value: escapeValue("1"),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(0);
  });

  test(BinaryOperator.ge, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.ge,
        value: escapeValue("-1"),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.ge} equals`, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.ge,
        value: escapeValue(partitionKey),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(BinaryOperator.lt, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.lt,
        value: escapeValue("1"),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.lt} negative`, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.lt,
        value: escapeValue("-1"),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(0);
  });

  test(BinaryOperator.le, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.le,
        value: escapeValue("1"),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.le} equals`, () => {
    expect.hasAssertions();

    const clauses: Clause[] = [
      {
        key: TableEntityPropertyNames.partitionKey,
        operator: BinaryOperator.le,
        value: escapeValue(partitionKey),
      },
    ];
    const filteredTableEntities = applyTableFilter(tableEntities, clauses);

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });
});
