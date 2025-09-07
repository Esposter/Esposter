import type { TableEntity } from "@azure/data-tables";

import { applyTableFilter } from "@/util/tableFilter/applyTableFilter";
import { BinaryOperator, isPartitionKey } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(applyTableFilter, () => {
  const partitionKey = "0";
  const rowKey = "0";
  const tableEntities: TableEntity[] = [{ partitionKey, rowKey }];

  test(BinaryOperator.eq, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey(partitionKey));

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.eq} negative`, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey("1"));

    expect(filteredTableEntities).toHaveLength(0);
  });

  test(BinaryOperator.gt, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey("-1", BinaryOperator.gt));

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.gt} negative`, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey("1", BinaryOperator.gt));

    expect(filteredTableEntities).toHaveLength(0);
  });

  test(BinaryOperator.ge, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey("-1", BinaryOperator.ge));

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.ge} equals`, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey(partitionKey, BinaryOperator.ge));

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(BinaryOperator.lt, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey("1", BinaryOperator.lt));

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.lt} negative`, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey("-1", BinaryOperator.lt));

    expect(filteredTableEntities).toHaveLength(0);
  });

  test(BinaryOperator.le, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey("1", BinaryOperator.le));

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });

  test(`${BinaryOperator.le} equals`, () => {
    expect.hasAssertions();

    const filteredTableEntities = applyTableFilter(tableEntities, isPartitionKey(partitionKey, BinaryOperator.le));

    expect(filteredTableEntities).toHaveLength(1);
    expect(filteredTableEntities[0].partitionKey).toBe(partitionKey);
  });
});
