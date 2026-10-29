import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";

import { getRecordedHistory } from "@/services/pageBuilder/getRecordedHistory";
import { createHistory, JsonPatchOperationType } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getRecordedHistory, () => {
  const TEST_INTERACTION_ID = "a";
  const TEST_LIMIT = 10;
  const TEST_PATH = "/content/0/props/content";
  const createEntry = (overrides: Partial<PageBuilderHistoryEntry> = {}): PageBuilderHistoryEntry => ({
    interactionId: TEST_INTERACTION_ID,
    inverses: [{ op: JsonPatchOperationType.Replace, path: TEST_PATH, value: "before" }],
    label: "a",
    operations: [{ op: JsonPatchOperationType.Replace, path: TEST_PATH, value: "after" }],
    ...overrides,
  });

  const createEmptyHistory = () => createHistory<PageBuilderHistoryEntry>(TEST_LIMIT);

  test("an entry with no operations records nothing", () => {
    expect.hasAssertions();

    const history = createEmptyHistory();

    expect(getRecordedHistory(history, createEntry({ operations: [] }))).toBe(history);
  });

  test("a second write to the same path in the same interaction merges into the newest entry", () => {
    expect.hasAssertions();

    const first = createEntry();
    const second = createEntry({
      inverses: [{ op: JsonPatchOperationType.Replace, path: TEST_PATH, value: "after" }],
      label: "b",
      operations: [{ op: JsonPatchOperationType.Replace, path: TEST_PATH, value: "later" }],
    });
    const history = getRecordedHistory(createEmptyHistory(), first);

    expect(getRecordedHistory(history, second).past).toStrictEqual([{ ...first, operations: second.operations }]);
  });

  test("edits outside any interaction never merge", () => {
    expect.hasAssertions();

    const first = createEntry({ interactionId: undefined });
    const history = getRecordedHistory(createEmptyHistory(), first);

    expect(getRecordedHistory(history, createEntry({ interactionId: undefined })).past).toHaveLength(2);
  });

  test("an edit in another interaction starts a new entry", () => {
    expect.hasAssertions();

    const history = getRecordedHistory(createEmptyHistory(), createEntry());

    expect(getRecordedHistory(history, createEntry({ interactionId: "b" })).past).toHaveLength(2);
  });

  test("an insert is never merged, since the nodes after it shift", () => {
    expect.hasAssertions();

    const insertPath = "/content/1";
    const insert = createEntry({
      inverses: [{ op: JsonPatchOperationType.Remove, path: insertPath }],
      operations: [{ op: JsonPatchOperationType.Add, path: insertPath, value: {} }],
    });
    const history = getRecordedHistory(createEmptyHistory(), insert);

    expect(getRecordedHistory(history, insert).past).toHaveLength(2);
  });

  test("a test is never merged, since it has no inverse to restore a value by", () => {
    expect.hasAssertions();

    const history = getRecordedHistory(createEmptyHistory(), createEntry());
    const testEntry = createEntry({
      inverses: [],
      operations: [{ op: JsonPatchOperationType.Test, path: TEST_PATH, value: "after" }],
    });

    expect(getRecordedHistory(history, testEntry).past).toHaveLength(2);
  });

  test("an edit that sets another path starts a new entry", () => {
    expect.hasAssertions();

    const history = getRecordedHistory(createEmptyHistory(), createEntry());

    expect(
      getRecordedHistory(
        history,
        createEntry({
          inverses: [{ op: JsonPatchOperationType.Replace, path: "/content/0/props/tag", value: "div" }],
          operations: [{ op: JsonPatchOperationType.Replace, path: "/content/0/props/tag", value: "main" }],
        }),
      ).past,
    ).toHaveLength(2);
  });
});
