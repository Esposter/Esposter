import type { Layout } from "#src/models/Layout";

import { FindingKind } from "#src/models/FindingKind";
import { checkLayout } from "#src/services/checkLayout";
import { createPanel } from "#src/services/createPanel.test";
import { createRegion } from "#src/services/createRegion.test";
import { describe, expect, test } from "vitest";

describe(checkLayout, () => {
  test("a selection kind with no content is reported", () => {
    expect.hasAssertions();

    const layout: Layout = {
      canvasId: "b",
      panels: [createPanel({ selectionKindContentKeyMap: { a: "a" }, wildcardContentKey: "" })],
      regions: [createRegion()],
    };

    expect(checkLayout(layout, ["a", "b"], ["a"])).toStrictEqual([{ kind: FindingKind.MissingContent, subject: "b" }]);
  });

  test("a content key nobody registered is reported", () => {
    expect.hasAssertions();

    const layout: Layout = {
      canvasId: "b",
      panels: [createPanel({ wildcardContentKey: "b" })],
      regions: [createRegion()],
    };

    expect(checkLayout(layout, ["a"], ["a"])).toStrictEqual([
      { kind: FindingKind.UnregisteredContentKey, subject: "b" },
    ]);
  });

  test("a duplicate id is reported", () => {
    expect.hasAssertions();

    const layout: Layout = { canvasId: "b", panels: [createPanel(), createPanel()], regions: [createRegion()] };

    expect(checkLayout(layout, ["a"], ["a"])).toStrictEqual([{ kind: FindingKind.DuplicateId, subject: "a" }]);
  });

  test("a panel in a region that does not exist is reported", () => {
    expect.hasAssertions();

    const layout: Layout = { canvasId: "b", panels: [createPanel({ regionId: "b" })], regions: [createRegion()] };

    expect(checkLayout(layout, ["a"], ["a"])).toStrictEqual([{ kind: FindingKind.UnknownRegion, subject: "a" }]);
  });
});
