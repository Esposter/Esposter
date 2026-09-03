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

    const funnel = createEntry("funnel", { content: { emailId: buildBlueprintEntryToken("audience") } });
    const keyReferencesMap = validateBlueprintEntries([createEntry("audience"), funnel]);

    expect(keyReferencesMap).toStrictEqual(
      new Map([
        ["audience", []],
        ["funnel", ["audience"]],
      ]),
    );
  });

  test("reads no references out of a nested blueprint's own manifest", () => {
    expect.hasAssertions();

    const nested = createEntry("child-blueprint", {
      content: {
        entries: [{ content: { emailId: buildBlueprintEntryToken("inner") }, key: "a", name: "a", type: "Program" }],
        parameters: [],
      },
      type: ResourceType.Blueprint,
    });

    expect(validateBlueprintEntries([nested])).toStrictEqual(new Map([["child-blueprint", []]]));
  });

  test("accepts an entry captured from a resource whose content was never written", () => {
    expect.hasAssertions();

    expect(validateBlueprintEntries([createEntry("audience", { content: undefined })])).toStrictEqual(
      new Map([["audience", []]]),
    );
  });

  // The name is substituted before this runs, so an over-long parameter value has to reject here rather
  // Than mid-loop against the database's own name constraint, after entries were already created
  test("fails a name that a parameter value grew past the resource name bound", () => {
    expect.hasAssertions();

    const entry = createEntry("audience", { name: "a".repeat(RESOURCE_NAME_MAX_LENGTH + 1) });

    expect(() => validateBlueprintEntries([entry])).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "invalid name for entry audience").message}]`,
    );
  });

  test("fails content its own type rejects", () => {
    expect.hasAssertions();

    const entry = createEntry("audience", { content: { emailId: "abc" } });

    expect(() => validateBlueprintEntries([entry])).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, "invalid content for entry audience").message}]`,
    );
  });
});
