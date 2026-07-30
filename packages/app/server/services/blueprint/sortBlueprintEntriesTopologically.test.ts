import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { sortBlueprintEntriesTopologically } from "@@/server/services/blueprint/sortBlueprintEntriesTopologically";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createEntry = (key: string): BlueprintEntry => ({ content: {}, key, name: key, type: ResourceType.Program });

describe(sortBlueprintEntriesTopologically, () => {
  test("orders dependencies before dependents", () => {
    expect.hasAssertions();

    const audience = createEntry("audience");
    const funnel = createEntry("funnel");
    const sortedEntries = sortBlueprintEntriesTopologically(
      [funnel, audience],
      new Map([
        ["audience", []],
        ["funnel", ["audience"]],
      ]),
    );

    expect(sortedEntries.map(({ key }) => key)).toStrictEqual(["audience", "funnel"]);
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
      sortBlueprintEntriesTopologically([createEntry("a")], new Map([["a", ["missing"]]])),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "unknown entry reference missing").message}]`,
    );
  });
});
