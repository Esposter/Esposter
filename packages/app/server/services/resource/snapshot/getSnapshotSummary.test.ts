import { getSnapshotSummary } from "@@/server/services/resource/snapshot/getSnapshotSummary";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getSnapshotSummary, () => {
  test(`${ResourceType.TodoList}: summarizes content through the type's own declaration`, () => {
    expect.hasAssertions();
    expect(getSnapshotSummary(ResourceType.TodoList, JSON.stringify({ items: [] }))).toBe("0 items");
  });

  // A snapshot is stored as the bytes it was taken from rather than as whatever today's schema makes of them,
  // So content the schema cannot read still becomes a snapshot — it simply has no summary
  test("returns no summary for content the schema cannot read", () => {
    expect.hasAssertions();
    expect(getSnapshotSummary(ResourceType.TodoList, "")).toBe("");
  });

  test(`${ResourceType.Note}: returns no summary for a type that declares none`, () => {
    expect.hasAssertions();
    expect(getSnapshotSummary(ResourceType.Note, JSON.stringify({ doc: { type: "doc" } }))).toBe("");
  });
});
