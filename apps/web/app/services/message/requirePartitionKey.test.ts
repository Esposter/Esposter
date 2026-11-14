import { requirePartitionKey } from "@/services/message/requirePartitionKey";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(requirePartitionKey, () => {
  const partitionKey = crypto.randomUUID();
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
