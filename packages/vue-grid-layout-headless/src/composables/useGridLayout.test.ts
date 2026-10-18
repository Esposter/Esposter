// @vitest-environment happy-dom
import type { GridCommit } from "#src/models/GridCommit";
import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridItem } from "#src/models/GridItem";
import type { GridLayout } from "#src/models/GridLayout";

import { useGridLayout } from "#src/composables/useGridLayout";
import { CollisionMode } from "#src/models/CollisionMode";
import { CompactType } from "#src/models/CompactType";
import { ResizeEdge } from "#src/models/ResizeEdge";
import { getCellPosition, getColumnPitch } from "#src/placement";
import { startExternalDrag } from "#src/services/startExternalDrag";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { defineComponent, h, shallowRef, useTemplateRef } from "vue";

// A tile's geometry as the inline style a test reads its position from
const getStyle = ({ height, left, top, width }: GridGeometry) => ({
  height: `${height}px`,
  left: `${left}px`,
  top: `${top}px`,
  width: `${width}px`,
});

describe(useGridLayout, () => {
  const columnNumber = 12;
  const dragStartDistance = 4;
  const gridWidth = 970;
  const pointerId = 1;
  const rowHeight = 40;
  const spacing = { gap: 10, padding: 10 };
  const cellPitch = getColumnPitch(gridWidth, columnNumber, spacing);
  const rowPitch = rowHeight + spacing.gap;

  // Mounts a grid whose tiles carry their geometry as inline styles, and whose handle resizes from the given edge, so a
  // Test reads where each one is drawn
  const mountGrid = (
    items: GridItem[],
    edge = ResizeEdge.SouthEast,
    gridSpacing = spacing,
    compactType = CompactType.Vertical,
    collision = CollisionMode.Push,
    gridColumnNumber = columnNumber,
  ) => {
    const onCommit = vi.fn<(commit: GridCommit) => void>();
    const gridLayout = shallowRef<GridLayout>();
    const wrapper = mount(
      defineComponent({
        setup() {
          const root = useTemplateRef<HTMLElement>("root");
          const layout = useGridLayout(root, () => ({
            collision,
            columnNumber: gridColumnNumber,
            compactType,
            dragStartDistance,
            isEditable: true,
            items,
            onCommit,
            rowHeight,
            spacing: gridSpacing,
          }));
          gridLayout.value = layout;
          const { placeholder, startGesture, tiles } = layout;

          return () =>
            h("div", { class: "grid", ref: "root" }, [
              ...tiles.value.map(({ geometry, item }) =>
                h(
                  "div",
                  {
                    class: "tile",
                    onPointerdown: (event: PointerEvent) => startGesture(event, item),
                    style: getStyle(geometry),
                  },
                  [
                    h("span", {
                      class: "handle",
                      onPointerdown: (event: PointerEvent) => {
                        event.stopPropagation();
                        startGesture(event, item, edge);
                      },
                    }),
                  ],
                ),
              ),
              placeholder.value ? h("div", { class: "placeholder", style: getStyle(placeholder.value) }) : null,
            ]);
        },
      }),
    );

    // A pointer over a grid is over its own root, so a release lands on the grid that was pressed
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([wrapper.element]);

    return { grid: gridLayout, onCommit, wrapper };
  };

  beforeEach(() => {
    // The DOM here hits nothing and has no elementsFromPoint to spy on, so a test stands one in for the browser's hit list
    document.elementsFromPoint = () => [];
    // A DOM without layout never reports the grid's width, so the observer reports the width the test lays it out at
    vi.stubGlobal(
      "ResizeObserver",
      class {
        readonly #callback: ResizeObserverCallback;

        constructor(callback: ResizeObserverCallback) {
          this.#callback = callback;
        }

        disconnect() {}
        observe(target: Element) {
          const entries = [{ contentRect: { height: 0, width: gridWidth }, target }] as ResizeObserverEntry[];
          queueMicrotask(() => this.#callback(entries, this));
        }
        unobserve() {}
      },
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("a press that barely moves stays a click", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }]);
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: 2, clientY: 0, pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a drag writes its changed cells once", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }]);
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();

    await tile.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }], removed: [] }]]);
  });

  test("a cancelled pointer writes nothing", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([
      { h: 2, id: "a", w: 2, x: 0, y: 0 },
      { h: 2, id: "b", w: 2, x: 4, y: 0 },
    ]);
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 4, clientY: 0, pointerId });

    expect(wrapper.findAll(".tile")[1]?.attributes("style")).toContain(
      `top: ${getCellPosition(2, rowPitch, spacing.padding)}px`,
    );

    await tile.trigger("pointercancel", { pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(false);
    expect(wrapper.findAll(".tile")[1]?.attributes("style")).toContain(
      `top: ${getCellPosition(0, rowPitch, spacing.padding)}px`,
    );
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a second pointer pressed during a drag", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([
      { h: 2, id: "a", w: 2, x: 0, y: 0 },
      { h: 2, id: "b", w: 2, x: 4, y: 0 },
    ]);
    const tiles = wrapper.findAll(".tile");
    await tiles[0]?.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tiles[0]?.trigger("pointermove", { buttons: 1, clientX: cellPitch, clientY: 0, pointerId });
    await tiles[1]?.trigger("pointerdown", { clientX: cellPitch * 4, clientY: 0, pointerId: pointerId + 1 });
    await tiles[1]?.trigger("pointerup", { clientX: cellPitch * 4, clientY: 0, pointerId: pointerId + 1 });

    expect(wrapper.find(".placeholder").exists()).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("#2 keeps tracking a drag whose pointer has left its tile", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }]);
    await wrapper.get(".tile").trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await wrapper.get(".grid").trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });
    await wrapper.get(".grid").trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }], removed: [] }]]);
  });

  test("#38 #51 Resizing from the left edge", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([{ h: 2, id: "a", w: 2, x: 2, y: 0 }], ResizeEdge.West);
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: -cellPitch, clientY: 0, pointerId });
    await handle.trigger("pointerup", { clientX: -cellPitch, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 3, x: 1, y: 0 }], removed: [] }]]);
  });

  test("a resize past the grid's edge", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }], ResizeEdge.West);
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: -cellPitch, clientY: 0, pointerId });

    expect(wrapper.get(".placeholder").attributes("style")).toContain(
      `left: ${getCellPosition(0, cellPitch, spacing.padding)}px`,
    );

    await handle.trigger("pointerup", { clientX: -cellPitch, clientY: 0, pointerId });

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("#17 #62 Padding the grid apart from its gaps", async () => {
    expect.hasAssertions();

    const gridSpacing = { gap: 4, padding: 20 };
    const { wrapper } = mountGrid(
      [
        { h: 1, id: "a", w: 1, x: 0, y: 0 },
        { h: 1, id: "b", w: 1, x: 1, y: 0 },
      ],
      ResizeEdge.SouthEast,
      gridSpacing,
    );
    // The grid measures its width in a microtask after mount, and the tiles are placed from that width
    await flushPromises();
    const pitch = getColumnPitch(gridWidth, columnNumber, gridSpacing);
    const [first, second] = wrapper.findAll(".tile");

    expect(first?.attributes("style")).toContain(`left: ${gridSpacing.padding}px`);
    expect(first?.attributes("style")).toContain(`top: ${gridSpacing.padding}px`);
    expect(second?.attributes("style")).toContain(`left: ${getCellPosition(1, pitch, gridSpacing.padding)}px`);
  });

  test("#36 Compacting sideways", async () => {
    expect.hasAssertions();

    const { wrapper } = mountGrid(
      [{ h: 1, id: "a", w: 2, x: 3, y: 0 }],
      ResizeEdge.SouthEast,
      spacing,
      CompactType.Horizontal,
    );
    await flushPromises();

    expect(wrapper.get(".tile").attributes("style")).toContain(
      `left: ${getCellPosition(0, cellPitch, spacing.padding)}px`,
    );
  });

  test("#36 Leaving a dropped item where it lands", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid(
      [{ h: 1, id: "a", w: 2, x: 0, y: 0 }],
      ResizeEdge.SouthEast,
      spacing,
      CompactType.None,
    );
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: 0, clientY: rowPitch * 2, pointerId });
    await tile.trigger("pointerup", { clientX: 0, clientY: rowPitch * 2, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 1, id: "a", w: 2, x: 0, y: 2 }], removed: [] }]]);
  });

  test("#11 #42 #55 An item grows to hold its content", async () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid([{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }]);
    await flushPromises();
    // Two rows hold the span less one gap, so content one pixel past that needs a third row
    grid.value?.reportContentHeight("a", 2 * rowPitch - spacing.gap + 1);

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 3, id: "a", w: 2, x: 0, y: 0 }], removed: [] }]]);
  });

  test("#66 Swapping two items on drop", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid(
      [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 4, y: 0 },
      ],
      ResizeEdge.SouthEast,
      spacing,
      CompactType.Vertical,
      CollisionMode.Swap,
    );
    await flushPromises();
    const tile = wrapper.findAll(".tile")[0];
    await tile?.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile?.trigger("pointermove", { buttons: 1, clientX: cellPitch * 4, clientY: 0, pointerId });
    await tile?.trigger("pointerup", { clientX: cellPitch * 4, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([
      [
        {
          changes: [
            { h: 2, id: "b", w: 2, x: 0, y: 0 },
            { h: 2, id: "a", w: 2, x: 4, y: 0 },
          ],
          removed: [],
        },
      ],
    ]);
  });

  test("a swap that lands on several items", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid(
      [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 2, y: 0 },
        { h: 2, id: "c", w: 2, x: 4, y: 0 },
      ],
      ResizeEdge.SouthEast,
      spacing,
      CompactType.Vertical,
      CollisionMode.Swap,
    );
    await flushPromises();
    const tile = wrapper.findAll(".tile")[0];
    await tile?.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile?.trigger("pointermove", { buttons: 1, clientX: cellPitch * 3, clientY: 0, pointerId });
    await tile?.trigger("pointerup", { clientX: cellPitch * 3, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([
      [
        {
          changes: [
            { h: 2, id: "a", w: 2, x: 3, y: 0 },
            { h: 2, id: "b", w: 2, x: 2, y: 2 },
            { h: 2, id: "c", w: 2, x: 4, y: 2 },
          ],
          removed: [],
        },
      ],
    ]);
  });

  test("a move refused under prevent", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid(
      [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 4, y: 0 },
      ],
      ResizeEdge.SouthEast,
      spacing,
      CompactType.Vertical,
      CollisionMode.Prevent,
    );
    await flushPromises();
    const tile = wrapper.findAll(".tile")[0];
    await tile?.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile?.trigger("pointermove", { buttons: 1, clientX: cellPitch * 4, clientY: 0, pointerId });
    await tile?.trigger("pointerup", { clientX: cellPitch * 4, clientY: 0, pointerId });

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("the grid's height is its last row's bottom plus the padding on both sides", () => {
    expect.hasAssertions();

    const { grid } = mountGrid([{ h: 1, id: "a", w: 1, x: 0, y: 0 }], ResizeEdge.SouthEast, { gap: 10, padding: 20 });

    expect(grid.value?.gridHeight.value).toBe(80);
  });

  test("#6 Dropping a palette entry into the grid", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid([]);
    await flushPromises();
    // The palette sits outside every grid, so its entry is dragged in from a plain element
    const palette = document.createElement("div");
    document.body.append(palette);
    onTestFinished(() => palette.remove());
    palette.addEventListener("pointerdown", (event) => startExternalDrag(event, { h: 2, id: "palette", w: 2 }));
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding, pointerId };
    palette.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, ...point }));
    palette.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, ...point }));
    palette.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, ...point }));

    expect(onCommit.mock.calls).toStrictEqual([
      [{ changes: [{ h: 2, id: "palette", w: 2, x: 2, y: 0 }], removed: [] }],
    ]);
  });

  test("a palette entry dropped onto an item under prevent is refused", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid(
      [{ h: 2, id: "a", w: 2, x: 0, y: 0 }],
      ResizeEdge.SouthEast,
      spacing,
      CompactType.Vertical,
      CollisionMode.Prevent,
    );
    await flushPromises();
    const palette = document.createElement("div");
    document.body.append(palette);
    onTestFinished(() => palette.remove());
    palette.addEventListener("pointerdown", (event) => startExternalDrag(event, { h: 2, id: "palette", w: 2 }));
    const point = { clientX: spacing.padding, clientY: spacing.padding, pointerId };
    palette.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, ...point }));
    palette.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, ...point }));

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a dropped item wider than the grid is narrowed to its columns", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid([], ResizeEdge.SouthEast, spacing, CompactType.Vertical, CollisionMode.Push, 4);
    await flushPromises();
    const palette = document.createElement("div");
    document.body.append(palette);
    onTestFinished(() => palette.remove());
    palette.addEventListener("pointerdown", (event) => startExternalDrag(event, { h: 2, id: "palette", w: 5 }));
    const point = { clientX: spacing.padding, clientY: spacing.padding, pointerId };
    palette.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, ...point }));
    palette.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, ...point }));

    expect(onCommit.mock.calls).toStrictEqual([
      [{ changes: [{ h: 2, id: "palette", w: 4, x: 0, y: 0 }], removed: [] }],
    ]);
  });

  test("a cancelled palette press accepts once on the next release", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid([]);
    await flushPromises();
    const palette = document.createElement("div");
    document.body.append(palette);
    onTestFinished(() => palette.remove());
    palette.addEventListener("pointerdown", (event) => startExternalDrag(event, { h: 2, id: "palette", w: 2 }));
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding, pointerId };
    palette.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, ...point }));
    palette.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, ...point }));
    palette.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, ...point }));
    palette.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, ...point }));

    expect(onCommit.mock.calls).toStrictEqual([
      [{ changes: [{ h: 2, id: "palette", w: 2, x: 2, y: 0 }], removed: [] }],
    ]);
  });

  test("#21 Moving an item into another grid", async () => {
    expect.hasAssertions();

    const source = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }]);
    const target = mountGrid([]);
    await flushPromises();
    const tile = source.wrapper.get(".tile");
    // The pointer is over the target past the source's right edge, so the target previews the item there, and the
    // Dragged tile is the first element under the pointer, which the release looks past
    vi.spyOn(document, "elementsFromPoint").mockImplementation((x) =>
      x >= cellPitch * 5 ? [tile.element, target.wrapper.element] : [tile.element, source.wrapper.element],
    );
    const point = { clientX: cellPitch * 6 + spacing.padding, clientY: 0, pointerId };
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { ...point, buttons: 1 });
    await tile.trigger("pointerup", point);

    expect(source.onCommit.mock.calls).toStrictEqual([[{ changes: [], removed: ["a"] }]]);
    expect(target.onCommit.mock.calls).toStrictEqual([
      [{ changes: [{ h: 2, id: "a", w: 2, x: 6, y: 0 }], removed: [] }],
    ]);
  });

  test("a move refused by the grid under the pointer commits nothing", async () => {
    expect.hasAssertions();

    const source = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }]);
    const target = mountGrid(
      [{ h: 2, id: "b", w: 2, x: 0, y: 0 }],
      ResizeEdge.SouthEast,
      spacing,
      CompactType.Vertical,
      CollisionMode.Prevent,
    );
    await flushPromises();
    const tile = source.wrapper.get(".tile");
    // The pointer releases over the target's own item, which prevent refuses to land the dragged item on
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([tile.element, target.wrapper.element]);
    const point = { clientX: spacing.padding, clientY: spacing.padding, pointerId };
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { ...point, buttons: 1 });
    await tile.trigger("pointerup", point);

    expect(source.onCommit).not.toHaveBeenCalled();
    expect(target.onCommit).not.toHaveBeenCalled();
  });

  test("#22 #40 Dragging inside a nested grid", async () => {
    expect.hasAssertions();

    const outerCommit = vi.fn<(commit: GridCommit) => void>();
    const innerCommit = vi.fn<(commit: GridCommit) => void>();
    const outerItems: GridItem[] = [{ h: 4, id: "outer", w: 12, x: 0, y: 0 }];
    const innerItems: GridItem[] = [{ h: 2, id: "inner", w: 2, x: 0, y: 0 }];
    const wrapper = mount(
      defineComponent({
        setup() {
          const outerRoot = useTemplateRef<HTMLElement>("outerRoot");
          const innerRoot = useTemplateRef<HTMLElement>("innerRoot");
          const outer = useGridLayout(outerRoot, () => ({
            collision: CollisionMode.Push,
            columnNumber,
            compactType: CompactType.Vertical,
            dragStartDistance,
            isEditable: true,
            items: outerItems,
            onCommit: outerCommit,
            rowHeight,
            spacing,
          }));
          const inner = useGridLayout(innerRoot, () => ({
            collision: CollisionMode.Push,
            columnNumber,
            compactType: CompactType.Vertical,
            dragStartDistance,
            isEditable: true,
            items: innerItems,
            onCommit: innerCommit,
            rowHeight,
            spacing,
          }));

          // The inner grid sits inside the outer grid's tile, so a press on its tile bubbles up through the outer tile too
          return () =>
            h(
              "div",
              { class: "grid", ref: "outerRoot" },
              outer.tiles.value.map(({ geometry, item }) =>
                h(
                  "div",
                  {
                    class: "outer-tile",
                    onPointerdown: (event: PointerEvent) => outer.startGesture(event, item),
                    style: getStyle(geometry),
                  },
                  [
                    h(
                      "div",
                      { class: "inner", ref: "innerRoot" },
                      inner.tiles.value.map(({ geometry: innerGeometry, item: innerItem }) =>
                        h("div", {
                          class: "inner-tile",
                          onPointerdown: (event: PointerEvent) => inner.startGesture(event, innerItem),
                          style: getStyle(innerGeometry),
                        }),
                      ),
                    ),
                  ],
                ),
              ),
            );
        },
      }),
    );
    await flushPromises();
    const tile = wrapper.get(".inner-tile");
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([tile.element, wrapper.get(".inner").element]);
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(outerCommit).not.toHaveBeenCalled();
    expect(innerCommit.mock.calls).toStrictEqual([
      [{ changes: [{ h: 2, id: "inner", w: 2, x: 2, y: 0 }], removed: [] }],
    ]);
  });

  test("a drop outside every grid", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }]);
    await flushPromises();
    // Outside every grid the pointer is over the page itself, which no grid claims, so the move the drag previewed is dropped
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([document.body]);
    const tile = wrapper.get(".tile");
    const point = { clientX: cellPitch * 4 + spacing.padding, clientY: 0, pointerId };
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { ...point, buttons: 1 });
    await tile.trigger("pointerup", point);

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a press whose pointer was released outside the grid starts no drag", async () => {
    expect.hasAssertions();

    const { wrapper } = mountGrid([{ h: 2, id: "a", w: 2, x: 0, y: 0 }]);
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    // The release fell outside the grid, so no release reached it, and the move that follows holds no button
    await tile.trigger("pointermove", { buttons: 0, clientX: cellPitch, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(false);
  });
});
