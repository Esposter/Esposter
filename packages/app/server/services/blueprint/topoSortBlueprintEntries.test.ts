import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { topoSortBlueprintEntries } from "@@/server/services/blueprint/topoSortBlueprintEntries";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(topoSortBlueprintEntries, () => {
  const createEntry = (key: string, content: unknown = {}): BlueprintEntry => ({
    content,
    key,
    name: key,
    type: ResourceType.Program,
  });

  test("orders dependencies before dependents", () => {
    expect.hasAssertions();

    const audience = createEntry("audience");
    const funnel = createEntry("funnel", { emailId: buildBlueprintEntryToken("audience") });
    const sortedEntries = topoSortBlueprintEntries([funnel, audience]);

    expect(sortedEntries.map(({ key }) => key)).toStrictEqual(["audience", "funnel"]);
  });

  test("fails with a cyclic entry reference", () => {
    expect.hasAssertions();

    const a = createEntry("a", { ref: buildBlueprintEntryToken("b") });
    const b = createEntry("b", { ref: buildBlueprintEntryToken("a") });

    expect(() => topoSortBlueprintEntries([a, b])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "cyclic entry reference a").message}]`,
    );
  });

  test("fails with an unknown entry reference", () => {
    expect.hasAssertions();

    const a = createEntry("a", { ref: buildBlueprintEntryToken("missing") });

    expect(() => topoSortBlueprintEntries([a])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "unknown entry reference missing").message}]`,
    );
  });
});
