import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { sortBlueprintEntriesTopologically } from "@@/server/services/blueprint/sortBlueprintEntriesTopologically";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createEntry = (key: string): BlueprintEntry => ({ content: {}, key, name: key, type: ResourceType.Program });

describe(sortBlueprintEntriesTopologically, () => {
  test("orders dependencies before dependents", () => {
    expect.hasAssertions();

    const sortedEntries = sortBlueprintEntriesTopologically(
      [createEntry("b"), createEntry("a")],
      new Map([
        ["a", []],
        ["b", ["a"]],
      ]),
    );

    expect(sortedEntries.map(({ key }) => key)).toStrictEqual(["a", "b"]);
  });

  test("fails with a cyclic entry reference", () => {
    expect.hasAssertions();

    const references = new Map([
      ["a", ["b"]],
      ["b", ["a"]],
    ]);

    expect(() =>
      sortBlueprintEntriesTopologically([createEntry("a"), createEntry("b")], references),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "cyclic entry reference a").message}]`,
    );
  });

  test("fails with an unknown entry reference", () => {
    expect.hasAssertions();

    expect(() =>
      sortBlueprintEntriesTopologically([createEntry("a")], new Map([["a", ["-1"]]])),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "unknown entry reference -1").message}]`,
    );
  });
});
