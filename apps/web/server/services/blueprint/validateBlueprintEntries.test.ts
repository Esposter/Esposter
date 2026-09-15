import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { buildBlueprintEntryToken } from "#shared/services/resource/blueprint/buildBlueprintEntryToken";
import { validateBlueprintEntries } from "@@/server/services/blueprint/validateBlueprintEntries";
import { DatabaseEntityType, RESOURCE_NAME_MAX_LENGTH, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createEntry = (key: string, rest: Partial<BlueprintEntry> = {}): BlueprintEntry => ({
  content: {},
  key,
  name: key,
  type: ResourceType.Program,
  ...rest,
});

describe(validateBlueprintEntries, () => {
  test("returns the entry references its content walk discovered", () => {
    expect.hasAssertions();

    const funnel = createEntry("b", { content: { emailId: buildBlueprintEntryToken("a") } });
    const keyReferencesMap = validateBlueprintEntries([createEntry("a"), funnel]);

    expect(keyReferencesMap).toStrictEqual(
      new Map([
        ["a", []],
        ["b", ["a"]],
      ]),
    );
  });

  test("reads no references out of a nested blueprint's own manifest", () => {
    expect.hasAssertions();

    const nested = createEntry("a", {
      content: {
        entries: [{ content: { emailId: buildBlueprintEntryToken("b") }, key: "b", name: "b", type: "Program" }],
        parameters: [],
      },
      type: ResourceType.Blueprint,
    });

    expect(validateBlueprintEntries([nested])).toStrictEqual(new Map([["a", []]]));
  });

  test("accepts an entry captured from a resource whose content was never written", () => {
    expect.hasAssertions();

    expect(validateBlueprintEntries([createEntry("a", { content: undefined })])).toStrictEqual(new Map([["a", []]]));
  });

  // The name is substituted before this runs, so an over-long parameter value has to reject here rather
  // Than mid-loop against the database's own name constraint, after entries were already created
  test("fails a name that a parameter value grew past the resource name bound", () => {
    expect.hasAssertions();

    const entry = createEntry("a", { name: "a".repeat(RESOURCE_NAME_MAX_LENGTH + 1) });

    expect(() => validateBlueprintEntries([entry])).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "invalid name for entry a").message}]`,
    );
  });

  test("fails content its own type rejects", () => {
    expect.hasAssertions();

    const entry = createEntry("a", { content: { emailId: " " } });

    expect(() => validateBlueprintEntries([entry])).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "invalid content for entry a").message}]`,
    );
  });
});
