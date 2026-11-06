import type { Context } from "#src/models/Context";
import type { Region } from "#src/models/Region";

import { RegionEdge } from "#src/models/RegionEdge";
import { RegionOpening } from "#src/models/RegionOpening";
import { RegionPresentation } from "#src/models/RegionPresentation";
import { SizeClass } from "#src/models/SizeClass";
import { createPanel } from "#src/services/createPanel.test";
import { createRegion } from "#src/services/createRegion.test";
import { getDefaultReaderState } from "#src/services/getDefaultReaderState";
import { resolveLayout } from "#src/services/resolveLayout";
import { describe, expect, test } from "vitest";

describe(resolveLayout, () => {
  const context: Context = { mode: "a", selectionCount: 1, selectionKind: "a", tool: "a" };
  const readerState = getDefaultReaderState();

  test("a panel is present only while its condition holds", () => {
    expect.hasAssertions();

    const layout = { canvasId: "b", panels: [createPanel({ condition: { tools: ["a"] } })], regions: [createRegion()] };

    expect(resolveLayout(layout, { ...context, tool: "b" }, SizeClass.Expanded, readerState).regions).toStrictEqual([]);
    expect(
      resolveLayout(layout, context, SizeClass.Expanded, readerState).regions.map((region) => region.panels),
    ).toStrictEqual([[{ contentKey: "a", id: "a" }]]);
  });

  test("content follows the selection kind", () => {
    expect.hasAssertions();

    const layout = {
      canvasId: "b",
      panels: [createPanel({ selectionKindContentKeyMap: { a: "c" }, wildcardContentKey: "d" })],
      regions: [createRegion()],
    };

    expect(
      resolveLayout(layout, { ...context, selectionKind: "a" }, SizeClass.Expanded, readerState).regions.map(
        (region) => region.panels,
      ),
    ).toStrictEqual([[{ contentKey: "c", id: "a" }]]);
    expect(
      resolveLayout(layout, { ...context, selectionKind: "b" }, SizeClass.Expanded, readerState).regions.map(
        (region) => region.panels,
      ),
    ).toStrictEqual([[{ contentKey: "d", id: "a" }]]);
  });

  test("a kind with no entry and no wildcard shows no panel", () => {
    expect.hasAssertions();

    const layout = {
      canvasId: "b",
      panels: [createPanel({ selectionKindContentKeyMap: { a: "c" }, wildcardContentKey: "" })],
      regions: [createRegion()],
    };

    expect(
      resolveLayout(layout, { ...context, selectionKind: "b" }, SizeClass.Expanded, readerState).regions,
    ).toStrictEqual([]);
  });

  test("an empty region is omitted", () => {
    expect.hasAssertions();

    const layout = { canvasId: "b", panels: [createPanel({ condition: { tools: ["b"] } })], regions: [createRegion()] };

    expect(resolveLayout(layout, context, SizeClass.Expanded, readerState)).toStrictEqual({
      canvasId: "b",
      regions: [],
    });
  });

  test("a region's presentation follows the size class", () => {
    expect.hasAssertions();

    const layout = {
      canvasId: "b",
      panels: [createPanel()],
      regions: [
        createRegion({
          sizeClassPresentationMap: {
            [SizeClass.Compact]: RegionPresentation.Sheet,
            [SizeClass.Expanded]: RegionPresentation.Docked,
            [SizeClass.Medium]: RegionPresentation.Docked,
          },
        }),
      ],
    };

    expect(
      resolveLayout(layout, context, SizeClass.Expanded, readerState).regions.map((region) => region.presentation),
    ).toStrictEqual([RegionPresentation.Docked]);
    expect(
      resolveLayout(layout, context, SizeClass.Compact, readerState).regions.map((region) => region.presentation),
    ).toStrictEqual([RegionPresentation.Sheet]);
  });

  test("a toolbar moves to the bottom when compact", () => {
    expect.hasAssertions();

    const toolbar: Region = createRegion({
      edge: RegionEdge.Top,
      sizeClassEdgeMap: { [SizeClass.Compact]: RegionEdge.Bottom },
    });
    const layout = { canvasId: "b", panels: [createPanel()], regions: [toolbar] };

    expect(
      resolveLayout(layout, context, SizeClass.Expanded, readerState).regions.map((region) => region.edge),
    ).toStrictEqual([RegionEdge.Top]);
    expect(
      resolveLayout(layout, context, SizeClass.Compact, readerState).regions.map((region) => region.edge),
    ).toStrictEqual([RegionEdge.Bottom]);
  });

  test("a sheet waits for the reader", () => {
    expect.hasAssertions();

    const properties = createRegion({
      opening: RegionOpening.WithContent,
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Sheet,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Docked,
      },
    });
    const layout = { canvasId: "b", panels: [createPanel()], regions: [properties] };

    expect(
      resolveLayout(layout, context, SizeClass.Compact, readerState).regions.map((region) => ({
        isOpen: region.isOpen,
        presentation: region.presentation,
      })),
    ).toStrictEqual([{ isOpen: false, presentation: RegionPresentation.Sheet }]);
  });

  test("a docked region opens with its content", () => {
    expect.hasAssertions();

    const properties = createRegion({
      opening: RegionOpening.WithContent,
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Sheet,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Docked,
      },
    });
    const layout = { canvasId: "b", panels: [createPanel()], regions: [properties] };

    expect(
      resolveLayout(layout, context, SizeClass.Expanded, readerState).regions.map((region) => region.isOpen),
    ).toStrictEqual([true]);
  });

  test("a resolved region carries its size limits", () => {
    expect.hasAssertions();

    const region = createRegion();
    const layout = { canvasId: "b", panels: [createPanel()], regions: [region] };

    expect(
      resolveLayout(layout, context, SizeClass.Expanded, readerState).regions.map((resolvedRegion) => ({
        maximumSize: resolvedRegion.maximumSize,
        minimumSize: resolvedRegion.minimumSize,
      })),
    ).toStrictEqual([{ maximumSize: region.maximumSize, minimumSize: region.minimumSize }]);
  });
});
