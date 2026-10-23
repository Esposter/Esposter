// @vitest-environment happy-dom
import type { GridCommit } from "#src/models/GridCommit";
import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridItem } from "#src/models/GridItem";
import type { GridLayout } from "#src/models/GridLayout";
import type { GridSpacing } from "#src/models/GridSpacing";

import { useGridLayout } from "#src/composables/useGridLayout";
import { CollisionMode } from "#src/models/CollisionMode";
import { CompactType } from "#src/models/CompactType";
import { ResizeEdge } from "#src/models/ResizeEdge";
import { getColumnPitch } from "#src/placement";
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
  const mountGrid = ({
    collision = CollisionMode.Push,
    columnNumber: gridColumnNumber = columnNumber,
    compactType = CompactType.Vertical,
    edge = ResizeEdge.SouthEast,
    isEditable = true,
    items,
    spacing: gridSpacing = spacing,
  }: {
    collision?: CollisionMode;
    columnNumber?: number;
    compactType?: CompactType;
    edge?: ResizeEdge;
    isEditable?: boolean;
    items: GridItem[];
    spacing?: GridSpacing;
  }) => {
    const onCommit = vi.fn<(commit: GridCommit) => void>();
    const gridLayout = shallowRef<GridLayout>();
    // The items are held as a ref, so a test can replace them under a gesture the way a version restore does
    const itemsRef = shallowRef(items);
    const wrapper = mount(
      defineComponent({
        setup() {
          const root = useTemplateRef<HTMLElement>("root");
          const layout = useGridLayout(root, () => ({
            collision,
            columnNumber: gridColumnNumber,
            compactType,
            dragStartDistance,
            isEditable,
            items: itemsRef.value,
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

    const setItems = (nextItems: GridItem[]) => {
      itemsRef.value = nextItems;
    };

    return { grid: gridLayout, onCommit, setItems, wrapper };
  };
  // The palette sits outside every grid, so an entry is dragged in from a plain element that starts the drag on a press.
  // The returned function fires a pointer event of the given type at that element
  const mountPalette = (item: Pick<GridItem, "h" | "id" | "w">) => {
    const palette = document.createElement("div");
    document.body.append(palette);
    onTestFinished(() => palette.remove());
    palette.addEventListener("pointerdown", (event) => startExternalDrag(event, item));
    return (type: string, point: { clientX: number; clientY: number }) =>
      palette.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId, ...point }));
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

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: 2, clientY: 0, pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a drag writes its changed cells once", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
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

    const { onCommit, wrapper } = mountGrid({
      items: [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 4, y: 0 },
      ],
    });
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 4, clientY: 0, pointerId });

    expect(wrapper.findAll(".tile")[1]?.attributes("style")).toBe(
      "height: 90px; left: 330px; top: 110px; width: 150px;",
    );

    await tile.trigger("pointercancel", { pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(false);
    expect(wrapper.findAll(".tile")[1]?.attributes("style")).toBe(
      "height: 90px; left: 330px; top: 10px; width: 150px;",
    );
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a layout replaced during a gesture ends it", async () => {
    expect.hasAssertions();

    const { onCommit, setItems, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch, clientY: 0, pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(true);

    setItems([{ h: 2, id: "a", w: 2, x: 4, y: 0 }]);
    await flushPromises();

    expect(wrapper.find(".placeholder").exists()).toBe(false);

    await wrapper.get(".grid").trigger("pointerup", { clientX: cellPitch, clientY: 0, pointerId });

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a second pointer pressed during a drag", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({
      items: [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 4, y: 0 },
      ],
    });
    await flushPromises();
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

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    await wrapper.get(".tile").trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await wrapper.get(".grid").trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });
    await wrapper.get(".grid").trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }], removed: [] }]]);
  });

  test("#38 #51 Resizing from the left edge", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ edge: ResizeEdge.West, items: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }] });
    await flushPromises();
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: -cellPitch, clientY: 0, pointerId });
    await handle.trigger("pointerup", { clientX: -cellPitch, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 3, x: 1, y: 0 }], removed: [] }]]);
  });

  test("a resize past the grid's edge", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ edge: ResizeEdge.West, items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: -cellPitch, clientY: 0, pointerId });

    expect(wrapper.get(".placeholder").attributes("style")).toBe("height: 90px; left: 10px; top: 10px; width: 150px;");

    await handle.trigger("pointerup", { clientX: -cellPitch, clientY: 0, pointerId });

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a grid draws no tiles before its width is known", async () => {
    expect.hasAssertions();

    const { grid, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });

    expect(grid.value?.tiles.value).toStrictEqual([]);

    await flushPromises();

    expect(wrapper.get(".tile").attributes("style")).toBe("height: 90px; left: 10px; top: 10px; width: 150px;");
  });

  test("#17 #62 Padding the grid apart from its gaps", async () => {
    expect.hasAssertions();

    const gridSpacing = { gap: 4, padding: 20 };
    const { wrapper } = mountGrid({
      items: [
        { h: 1, id: "a", w: 1, x: 0, y: 0 },
        { h: 1, id: "b", w: 1, x: 1, y: 0 },
      ],
      spacing: gridSpacing,
    });
    // The grid measures its width in a microtask after mount, and the tiles are placed from that width
    await flushPromises();
    const [first, second] = wrapper.findAll(".tile");

    expect(first?.attributes("style")).toBe("height: 40px; left: 20px; top: 20px; width: 73.833333px;");
    expect(second?.attributes("style")).toBe("height: 40px; left: 98px; top: 20px; width: 73.833333px;");
  });

  test("#36 Compacting sideways", async () => {
    expect.hasAssertions();

    const { wrapper } = mountGrid({
      compactType: CompactType.Horizontal,
      items: [{ h: 1, id: "a", w: 2, x: 3, y: 0 }],
    });
    await flushPromises();

    expect(wrapper.get(".tile").attributes("style")).toBe("height: 40px; left: 10px; top: 10px; width: 150px;");
  });

  test("#36 Leaving a dropped item where it lands", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({
      compactType: CompactType.None,
      items: [{ h: 1, id: "a", w: 2, x: 0, y: 0 }],
    });
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: 0, clientY: rowPitch * 2, pointerId });
    await tile.trigger("pointerup", { clientX: 0, clientY: rowPitch * 2, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 1, id: "a", w: 2, x: 0, y: 2 }], removed: [] }]]);
  });

  test("#11 #42 #55 An item grows to hold its content", async () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }] });
    await flushPromises();
    // Two row pitches of content are taller than two rows hold, since a row's gap belongs to the cell below it
    grid.value?.reportContentHeight("a", 100);

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 3, id: "a", w: 2, x: 0, y: 0 }], removed: [] }]]);
  });

  test("#66 Swapping two items on drop", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({
      collision: CollisionMode.Swap,
      items: [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 4, y: 0 },
      ],
    });
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

    const { onCommit, wrapper } = mountGrid({
      collision: CollisionMode.Swap,
      items: [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 2, y: 0 },
        { h: 2, id: "c", w: 2, x: 4, y: 0 },
      ],
    });
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

    const { onCommit, wrapper } = mountGrid({
      collision: CollisionMode.Prevent,
      items: [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 4, y: 0 },
      ],
    });
    await flushPromises();
    const tile = wrapper.findAll(".tile")[0];
    await tile?.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile?.trigger("pointermove", { buttons: 1, clientX: cellPitch * 4, clientY: 0, pointerId });
    await tile?.trigger("pointerup", { clientX: cellPitch * 4, clientY: 0, pointerId });

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("the grid's height is its last row's bottom plus the padding on both sides", () => {
    expect.hasAssertions();

    const { grid } = mountGrid({ items: [{ h: 1, id: "a", w: 1, x: 0, y: 0 }], spacing: { gap: 10, padding: 20 } });

    expect(grid.value?.gridHeight.value).toBe(80);
  });

  // The drop lands on the column under the pointer, so a pointer a little short of column 2's edge is still in column 1
  test.each([
    [cellPitch * 2 + spacing.padding, 2],
    [138, 1],
  ])("#6 Dropping a palette entry at clientX %s lands in column %s", async (clientX, x) => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ items: [] });
    await flushPromises();
    const dispatch = mountPalette({ h: 2, id: "palette", w: 2 });
    const point = { clientX, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointermove", point);
    dispatch("pointerup", point);

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "palette", w: 2, x, y: 0 }], removed: [] }]]);
  });

  test("a palette entry dropped onto an item under prevent is refused", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ collision: CollisionMode.Prevent, items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const dispatch = mountPalette({ h: 2, id: "palette", w: 2 });
    const point = { clientX: spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a grid that is not editable refuses a palette drop", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ isEditable: false, items: [] });
    await flushPromises();
    const dispatch = mountPalette({ h: 2, id: "palette", w: 2 });
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a dropped item wider than the grid is narrowed to its columns", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ columnNumber: 4, items: [] });
    await flushPromises();
    const dispatch = mountPalette({ h: 2, id: "palette", w: 5 });
    const point = { clientX: spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onCommit.mock.calls).toStrictEqual([
      [{ changes: [{ h: 2, id: "palette", w: 4, x: 0, y: 0 }], removed: [] }],
    ]);
  });

  test("a cancelled palette press accepts once on the next release", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ items: [] });
    await flushPromises();
    const dispatch = mountPalette({ h: 2, id: "palette", w: 2 });
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointercancel", point);
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onCommit.mock.calls).toStrictEqual([
      [{ changes: [{ h: 2, id: "palette", w: 2, x: 2, y: 0 }], removed: [] }],
    ]);
  });

  test("#21 Moving an item into another grid", async () => {
    expect.hasAssertions();

    const source = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    const target = mountGrid({ items: [] });
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

    const source = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    const target = mountGrid({ collision: CollisionMode.Prevent, items: [{ h: 2, id: "b", w: 2, x: 0, y: 0 }] });
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
    const innerGrid = shallowRef<GridLayout>();
    // The inner grid is a component of its own, as a nested grid is in an app, so its root mounts with its tile
    const InnerGrid = defineComponent({
      setup() {
        const innerRoot = useTemplateRef<HTMLElement>("innerRoot");
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
        innerGrid.value = inner;

        return () =>
          h(
            "div",
            { class: "inner", ref: "innerRoot" },
            inner.tiles.value.map(({ geometry, item }) =>
              h("div", {
                class: "inner-tile",
                onPointerdown: (event: PointerEvent) => inner.startGesture(event, item),
                style: getStyle(geometry),
              }),
            ),
          );
      },
    });
    const wrapper = mount(
      defineComponent({
        setup() {
          const outerRoot = useTemplateRef<HTMLElement>("outerRoot");
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
                  [h(InnerGrid)],
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

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
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

  test("a press from a secondary button starts no drag", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { button: 2, clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 2, clientX: cellPitch, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: cellPitch, clientY: 0, pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a press whose pointer was released outside the grid starts no drag", async () => {
    expect.hasAssertions();

    const { wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    // The release fell outside the grid, so no release reached it, and the move that follows holds no button
    await tile.trigger("pointermove", { buttons: 0, clientX: cellPitch, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(wrapper.find(".placeholder").exists()).toBe(false);
  });
});
