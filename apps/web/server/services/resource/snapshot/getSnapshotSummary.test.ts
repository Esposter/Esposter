import { getSnapshotSummary } from "#server/services/resource/snapshot/getSnapshotSummary";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
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

  // A group is a visual of the dashboard too, so the count reads every visual in the tree
  test(`${ResourceType.Dashboard}: counts every visual in the tree, a group's included`, () => {
    expect.hasAssertions();

    const dashboard = new Dashboard({
      visuals: [
        new Visual({
          type: VisualType.Group,
          visuals: [new Visual({ type: VisualType.Bar }), new Visual({ type: VisualType.Table })],
        }),
        new Visual({ type: VisualType.Card }),
      ],
    });

    expect(getSnapshotSummary(ResourceType.Dashboard, JSON.stringify(dashboard))).toBe("4 visuals");
  });

  test(`${ResourceType.Note}: returns no summary for a type that declares none`, () => {
    expect.hasAssertions();

    expect(getSnapshotSummary(ResourceType.Note, JSON.stringify({ doc: EMPTY_NOTE_DOC }))).toBe("");
  });
});
