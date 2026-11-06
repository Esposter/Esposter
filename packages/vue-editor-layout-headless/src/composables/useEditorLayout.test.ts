import type { Context } from "#src/models/Context";
import type { Layout } from "#src/models/Layout";

import { useEditorLayout } from "#src/composables/useEditorLayout";
import { SizeClass } from "#src/models/SizeClass";
import { createPanel } from "#src/services/createPanel.test";
import { createRegion } from "#src/services/createRegion.test";
import { getDefaultReaderState } from "#src/services/getDefaultReaderState";
import { describe, expect, test } from "vitest";
import { reactive } from "vue";

describe(useEditorLayout, () => {
  const context: Context = { mode: "a", selectionCount: 1, selectionKind: "a", tool: "a" };

  test("a change of selection re-resolves the layout", () => {
    expect.hasAssertions();

    const reactiveContext = reactive<Context>({ mode: "a", selectionCount: 0, selectionKind: "", tool: "a" });
    const layout: Layout = {
      canvasId: "b",
      panels: [createPanel({ selectionKindContentKeyMap: { a: "c" }, wildcardContentKey: "" })],
      regions: [createRegion()],
    };
    const editorLayout = useEditorLayout(layout, reactiveContext, SizeClass.Expanded, getDefaultReaderState());

    expect(editorLayout.resolvedLayout.value.regions).toStrictEqual([]);

    reactiveContext.selectionCount = 1;
    reactiveContext.selectionKind = "a";

    expect(editorLayout.resolvedLayout.value.regions.map((region) => region.panels)).toStrictEqual([
      [{ contentKey: "c", id: "a" }],
    ]);
  });

  test("a resize is kept in the reader's state", () => {
    expect.hasAssertions();

    const layout: Layout = { canvasId: "b", panels: [createPanel()], regions: [createRegion()] };
    const editorLayout = useEditorLayout(layout, context, SizeClass.Expanded, getDefaultReaderState());

    editorLayout.resizeRegion("a", 9);

    expect(editorLayout.readerState.value.regionSizeMap).toStrictEqual({ a: 3 });
  });
});
