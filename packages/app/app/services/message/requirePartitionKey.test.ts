import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { randomUUID } from "node:crypto";
import { describe, expect, test } from "vitest";

describe(requirePartitionKey, () => {
  const partitionKey = randomUUID();
  const name = "name";

  test("returns the partition key when non-empty", () => {
    expect.hasAssertions();

    expect(requirePartitionKey(partitionKey, name)).toBe(partitionKey);
  });

  test("throws when the partition key is empty", () => {
    expect.hasAssertions();

    expect(() => requirePartitionKey("", name)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, name, CompositeKeyPropertyNames.partitionKey).message}]`,
    );
  });
});
