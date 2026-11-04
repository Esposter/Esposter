// @vitest-environment happy-dom
import type { GridBlock } from "#src/models/GridBlock";
import type { GridCell } from "#src/models/GridCell";
import type { GridCommit } from "#src/models/GridCommit";
import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridItem } from "#src/models/GridItem";
import type { GridLayout } from "#src/models/GridLayout";
import type { GridSpacing } from "#src/models/GridSpacing";
import type { GridTransfer } from "#src/models/GridTransfer";

import { useGridLayout } from "#src/composables/useGridLayout";
import { CollisionMode } from "#src/models/CollisionMode";
import { CompactType } from "#src/models/CompactType";
import { ResizeEdge } from "#src/models/ResizeEdge";
import { getColumnPitch } from "#src/placement/getColumnPitch";
import { startExternalDrag } from "#src/services/startExternalDrag";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { defineComponent, h, shallowRef, useTemplateRef } from "vue";

// An item as a test writes it: its height flag is stated only where a test reads it, and absent means false
type TestItem = GridBlock & { isAutoHeight?: boolean };
const toGridItem = (item: TestItem): GridItem => ({ isAutoHeight: false, ...item });

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
    onTransfer,
    spacing: gridSpacing = spacing,
  }: {
    collision?: CollisionMode;
    columnNumber?: number;
    compactType?: CompactType;
    edge?: ResizeEdge;
    isEditable?: boolean;
    items: TestItem[];
    onTransfer?: (transfer: GridTransfer) => void;
    spacing?: GridSpacing;
  }) => {
    const onCommit = vi.fn<(commit: GridCommit) => void>();
    const gridLayout = shallowRef<GridLayout>();
    // The items are held as a ref, so a test can replace them under a gesture the way a version restore does
    const itemsRef = shallowRef(items.map((item) => toGridItem(item)));
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
            onTransfer,
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
                    onPointerdown: (event: PointerEvent) => {
                      startGesture(event, item);
                    },
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
              placeholder.value
                ? h("div", {
                    class: placeholder.value.isRefused ? "placeholder refused" : "placeholder",
                    style: getStyle(placeholder.value.geometry),
                  })
                : null,
            ]);
        },
      }),
    );

    // A pointer over a grid is over its own root, so a release lands on the grid that was pressed
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([wrapper.element]);

    const setItems = (nextItems: TestItem[]) => {
      itemsRef.value = nextItems.map((item) => toGridItem(item));
    };

    return { grid: gridLayout, onCommit, setItems, wrapper };
  };
  // The palette sits outside every grid, so an entry is dragged in from a plain element that starts the drag on a press.
  // The returned dispatch fires a pointer event of the given type at that element, and onDrop is the callback the drop calls
  const mountPalette = (item: TestItem) => {
    const palette = document.createElement("div");
    document.body.append(palette);
    onTestFinished(() => {
      palette.remove();
    });
    const onDrop = vi.fn<(cell: GridCell) => void>();
    palette.addEventListener("pointerdown", (event) => {
      startExternalDrag(event, toGridItem(item), onDrop);
    });
    const dispatch = (type: string, point: { clientX: number; clientY: number }) =>
      palette.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId, ...point }));
    return { dispatch, onDrop };
  };

  // An inner grid is a component of its own, so its root is mounted and registered as a grid inside an item is, and the outer
  // Grid's tile holds it, so a press on the inner tile bubbles up through the outer tile too
  const mountNestedGrids = () => {
    const innerCommit = vi.fn<(commit: GridCommit) => void>();
    const outerCommit = vi.fn<(commit: GridCommit) => void>();
    const innerItems = [toGridItem({ h: 2, id: "b", w: 2, x: 0, y: 0 })];
    const outerItems = [toGridItem({ h: 4, id: "a", w: 2, x: 0, y: 0 })];
    const InnerGrid = defineComponent({
      setup() {
        const root = useTemplateRef<HTMLElement>("root");
        const { startGesture, tiles } = useGridLayout(root, () => ({
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

        return () =>
          h(
            "div",
            { class: "inner", ref: "root" },
            tiles.value.map(({ geometry, item }) =>
              h("div", {
                class: "inner-tile",
                onPointerdown: (event: PointerEvent) => {
                  startGesture(event, item);
                },
                style: getStyle(geometry),
              }),
            ),
          );
      },
    });
    const wrapper = mount(
      defineComponent({
        setup() {
          const root = useTemplateRef<HTMLElement>("root");
          const { startGesture, tiles } = useGridLayout(root, () => ({
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

          return () =>
            h(
              "div",
              { class: "grid", ref: "root" },
              tiles.value.map(({ geometry, item }) =>
                h(
                  "div",
                  {
                    class: "outer-tile",
                    onPointerdown: (event: PointerEvent) => {
                      startGesture(event, item);
                    },
                    style: getStyle(geometry),
                  },
                  [h(InnerGrid)],
                ),
              ),
            );
        },
      }),
    );

    return { innerCommit, outerCommit, wrapper };
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
          queueMicrotask(() => {
            this.#callback(entries, this);
          });
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

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }] }]]);
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

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }] }]]);
  });

  test("#38 #51 Resizing from the left edge", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ edge: ResizeEdge.West, items: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }] });
    await flushPromises();
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: -cellPitch, clientY: 0, pointerId });
    await handle.trigger("pointerup", { clientX: -cellPitch, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 3, x: 1, y: 0 }] }]]);
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

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 1, id: "a", w: 2, x: 0, y: 2 }] }]]);
  });

  test("#11 #42 #55 An item grows to hold its content", async () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }] });
    await flushPromises();
    // Two row pitches of content are taller than two rows hold, since a row's gap belongs to the cell below it
    grid.value?.reportContentHeight("a", 100);

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 3, id: "a", w: 2, x: 0, y: 0 }] }]]);
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

  test("a step onto a free cell is committed", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });

    expect(grid.value?.stepItem("a", { dx: 1 })).toBe(true);
    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 1, y: 0 }] }]]);
  });

  test("a step past the last column changes nothing", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 10, y: 0 }] });

    expect(grid.value?.stepItem("a", { dx: 1 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a resize step never shrinks an item below one cell", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", w: 1, x: 0, y: 0 }] });

    expect(grid.value?.stepItem("a", { dw: -1 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a step onto another item under prevent is refused", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({
      collision: CollisionMode.Prevent,
      items: [
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 2, id: "b", w: 2, x: 2, y: 0 },
      ],
    });

    expect(grid.value?.stepItem("a", { dx: 2 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a step above the top row changes nothing", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", isAutoHeight: false, w: 2, x: 0, y: 0 }] });

    expect(grid.value?.stepItem("a", { dy: -1 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a step that grows an item past the last column changes nothing", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", isAutoHeight: false, w: 4, x: 8, y: 0 }] });

    expect(grid.value?.stepItem("a", { dw: 1 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a step that shrinks an item below one cell in height changes nothing", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 1, id: "a", isAutoHeight: false, w: 2, x: 0, y: 0 }] });

    expect(grid.value?.stepItem("a", { dh: -1 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a step that moves an item past the last column changes nothing", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", isAutoHeight: false, w: 4, x: 8, y: 0 }] });

    expect(grid.value?.stepItem("a", { dx: 1 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("an auto-height item's south handle changes no height", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({
      edge: ResizeEdge.South,
      items: [{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }],
    });
    await flushPromises();
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: 0, clientY: rowPitch * 3, pointerId });
    await handle.trigger("pointerup", { clientX: 0, clientY: rowPitch * 3, pointerId });

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("an auto-height item's corner handle changes no height", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({
      edge: ResizeEdge.SouthEast,
      items: [{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }],
    });
    await flushPromises();
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: 0, clientY: rowPitch * 3, pointerId });
    await handle.trigger("pointerup", { clientX: 0, clientY: rowPitch * 3, pointerId });

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("an auto-height item's east handle resizes its width and keeps its height", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({
      edge: ResizeEdge.East,
      items: [{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }],
    });
    await flushPromises();
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: cellPitch, clientY: 0, pointerId });
    await handle.trigger("pointerup", { clientX: cellPitch, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 3, x: 0, y: 0 }] }]]);
  });

  test("a step changing an auto-height item's height changes nothing", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({ items: [{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }] });

    expect(grid.value?.stepItem("a", { dh: 1 })).toBe(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a touch press on a handle moves the item", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({
      edge: ResizeEdge.East,
      items: [{ h: 2, id: "a", isAutoHeight: false, w: 2, x: 0, y: 0 }],
    });
    await flushPromises();
    const handle = wrapper.get(".handle").element;
    handle.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: 0, clientY: 0, pointerId, pointerType: "touch" }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        buttons: 1,
        clientX: cellPitch,
        clientY: 0,
        pointerId,
        pointerType: "touch",
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, clientX: cellPitch, clientY: 0, pointerId, pointerType: "touch" }),
    );

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 1, y: 0 }] }]]);
  });

  test("a touch press on a tile's body still moves it", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", isAutoHeight: false, w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const tile = wrapper.get(".tile").element;
    tile.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: 0, clientY: 0, pointerId, pointerType: "touch" }),
    );
    tile.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        buttons: 1,
        clientX: cellPitch,
        clientY: 0,
        pointerId,
        pointerType: "touch",
      }),
    );
    tile.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, clientX: cellPitch, clientY: 0, pointerId, pointerType: "touch" }),
    );

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 1, y: 0 }] }]]);
  });

  test("a layout replaced during a palette drag clears its drop preview", async () => {
    expect.hasAssertions();

    const { grid, setItems } = mountGrid({ items: [] });
    await flushPromises();
    const { dispatch } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    dispatch("pointerdown", { clientX: 0, clientY: 0 });
    dispatch("pointermove", { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding });

    expect(grid.value?.placeholder.value).toBeDefined();

    setItems([{ h: 2, id: "b", isAutoHeight: false, w: 2, x: 6, y: 0 }]);
    await flushPromises();

    expect(grid.value?.placeholder.value).toBeUndefined();
  });

  test("a published grid's auto-height item reports no height change", () => {
    expect.hasAssertions();

    const { grid, onCommit } = mountGrid({
      isEditable: false,
      items: [{ h: 2, id: "a", isAutoHeight: true, w: 2, x: 0, y: 0 }],
    });

    grid.value?.reportContentHeight("a", 200);

    expect(onCommit).not.toHaveBeenCalled();
  });

  test("hovering the grid previews the landing cell", async () => {
    expect.hasAssertions();

    const { grid } = mountGrid({ items: [] });
    await flushPromises();
    const { dispatch } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    dispatch("pointerdown", { clientX: 0, clientY: 0 });
    dispatch("pointermove", { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding });

    expect(grid.value?.placeholder.value).toStrictEqual({
      geometry: { height: 90, left: 170, top: 10, width: 150 },
      isRefused: false,
    });
  });

  test("hovering an item under prevent previews a refusal", async () => {
    expect.hasAssertions();

    const { grid } = mountGrid({ collision: CollisionMode.Prevent, items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const { dispatch } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    dispatch("pointerdown", { clientX: 0, clientY: 0 });
    dispatch("pointermove", { clientX: spacing.padding, clientY: spacing.padding });

    expect(grid.value?.placeholder.value).toStrictEqual({
      geometry: { height: 90, left: 10, top: 10, width: 150 },
      isRefused: true,
    });
  });

  test("a palette drag moving within the cell it is over keeps its preview", async () => {
    expect.hasAssertions();

    const { grid } = mountGrid({ items: [] });
    await flushPromises();
    const { dispatch } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    dispatch("pointerdown", { clientX: 0, clientY: 0 });
    dispatch("pointermove", { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding });
    const placeholder = grid.value?.placeholder.value;
    dispatch("pointermove", { clientX: cellPitch * 2 + spacing.padding + 1, clientY: spacing.padding });

    expect(grid.value?.placeholder.value).toBe(placeholder);
  });

  test("a layout change under a held palette preview is redrawn on the next move within its cell", async () => {
    expect.hasAssertions();

    const { grid, setItems } = mountGrid({ items: [] });
    await flushPromises();
    const { dispatch } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    dispatch("pointerdown", { clientX: 0, clientY: 0 });
    dispatch("pointermove", { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding });
    setItems([{ h: 2, id: "a", w: 2, x: 2, y: 0 }]);
    await flushPromises();
    const getTileTop = () => grid.value?.tiles.value.find(({ item }) => item.id === "a")?.geometry.top;
    const topBefore = getTileTop();
    expect(topBefore).toBeDefined();
    dispatch("pointermove", { clientX: cellPitch * 2 + spacing.padding + 1, clientY: spacing.padding });

    expect(getTileTop()).toBeGreaterThan(Number(topBefore));
  });

  test("leaving the grid clears the preview", async () => {
    expect.hasAssertions();

    const { grid } = mountGrid({ items: [] });
    await flushPromises();
    const { dispatch } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    dispatch("pointerdown", { clientX: 0, clientY: 0 });
    dispatch("pointermove", { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding });

    expect(grid.value?.placeholder.value).toBeDefined();

    vi.spyOn(document, "elementsFromPoint").mockReturnValue([document.body]);
    dispatch("pointermove", { clientX: -1, clientY: -1 });

    expect(grid.value?.placeholder.value).toBeUndefined();
  });

  // The drop lands on the column under the pointer, so a pointer a little short of column 2's edge is still in column 1
  test.each([
    [cellPitch * 2 + spacing.padding, 2],
    [138, 1],
  ])("#6 dropping a palette entry into the grid at clientX %s lands in column %s", async (clientX, x) => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ items: [] });
    await flushPromises();
    const { dispatch, onDrop } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    const point = { clientX, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointermove", point);
    dispatch("pointerup", point);

    expect(onDrop.mock.calls).toStrictEqual([[{ h: 2, w: 2, x, y: 0 }]]);
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a palette entry dropped onto an item under prevent is refused", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ collision: CollisionMode.Prevent, items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    const { dispatch, onDrop } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    const point = { clientX: spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onDrop).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a grid that is not editable refuses a palette drop", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ isEditable: false, items: [] });
    await flushPromises();
    const { dispatch, onDrop } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onDrop).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });

  test("a dropped item wider than the grid is narrowed to its columns", async () => {
    expect.hasAssertions();

    mountGrid({ columnNumber: 4, items: [] });
    await flushPromises();
    const { dispatch, onDrop } = mountPalette({ h: 2, id: "palette", w: 5, x: 0, y: 0 });
    const point = { clientX: spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onDrop.mock.calls).toStrictEqual([[{ h: 2, w: 4, x: 0, y: 0 }]]);
  });

  test("a cancelled palette press accepts once on the next release", async () => {
    expect.hasAssertions();

    mountGrid({ items: [] });
    await flushPromises();
    const { dispatch, onDrop } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointercancel", point);
    dispatch("pointerdown", point);
    dispatch("pointerup", point);

    expect(onDrop.mock.calls).toStrictEqual([[{ h: 2, w: 2, x: 2, y: 0 }]]);
  });

  test("a drop outside every grid", async () => {
    expect.hasAssertions();

    const { onCommit } = mountGrid({ items: [] });
    await flushPromises();
    // Outside every grid the pointer is over the page itself, which no grid claims, so the entry is not dropped
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([document.body]);
    const { dispatch, onDrop } = mountPalette({ h: 2, id: "palette", w: 2, x: 0, y: 0 });
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding };
    dispatch("pointerdown", point);
    dispatch("pointermove", point);
    dispatch("pointerup", point);

    expect(onDrop).not.toHaveBeenCalled();
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

  test("#22 a press on a nested grid's item is not the outer grid's", async () => {
    expect.hasAssertions();

    const { outerCommit, wrapper } = mountNestedGrids();
    await flushPromises();
    const tile = wrapper.get(".inner-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(outerCommit).not.toHaveBeenCalled();
  });

  test("#40 a nested item's gesture moves only the inner grid's item", async () => {
    expect.hasAssertions();

    const { innerCommit, wrapper } = mountNestedGrids();
    await flushPromises();
    const tile = wrapper.get(".inner-tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(innerCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "b", w: 2, x: 2, y: 0 }] }]]);
  });

  test("#21 hovering another grid previews the landing cell there", async () => {
    expect.hasAssertions();

    const onTransfer = vi.fn<(transfer: GridTransfer) => void>();
    const source = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }], onTransfer });
    const target = mountGrid({ items: [] });
    await flushPromises();
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([target.wrapper.element]);
    const tile = source.wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", {
      buttons: 1,
      clientX: cellPitch * 2 + spacing.padding,
      clientY: spacing.padding,
      pointerId,
    });

    expect(target.wrapper.get(".placeholder").attributes("style")).toBe(
      "height: 90px; left: 170px; top: 10px; width: 150px;",
    );
    expect(source.wrapper.find(".placeholder").exists()).toBe(false);
  });

  test("#21 releasing over another grid hands the item to onTransfer and the source commits nothing", async () => {
    expect.hasAssertions();

    const onTransfer = vi.fn<(transfer: GridTransfer) => void>();
    const source = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }], onTransfer });
    // The landing pushes the item already in the target down a row, and the target commits that push
    const target = mountGrid({ items: [{ h: 2, id: "b", w: 2, x: 2, y: 0 }] });
    await flushPromises();
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([target.wrapper.element]);
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding };
    const tile = source.wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, ...point, pointerId });
    await tile.trigger("pointerup", { ...point, pointerId });

    expect(source.onCommit).not.toHaveBeenCalled();
    expect(target.onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "b", w: 2, x: 2, y: 2 }] }]]);
    expect(onTransfer).toHaveBeenCalledExactlyOnceWith({
      cell: { h: 2, w: 2, x: 2, y: 0 },
      item: { h: 2, id: "a", isAutoHeight: false, w: 2, x: 0, y: 0 },
      target: target.wrapper.element,
    });
  });

  test("#21 releasing over a grid that refuses the item returns it", async () => {
    expect.hasAssertions();

    const onTransfer = vi.fn<(transfer: GridTransfer) => void>();
    const source = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }], onTransfer });
    // Under prevent the landing on the target's item is refused, so the target gives no cell back
    const target = mountGrid({ collision: CollisionMode.Prevent, items: [{ h: 2, id: "b", w: 2, x: 2, y: 0 }] });
    await flushPromises();
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([target.wrapper.element]);
    const point = { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding };
    const tile = source.wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, ...point, pointerId });
    await tile.trigger("pointerup", { ...point, pointerId });

    expect(onTransfer).not.toHaveBeenCalled();
    expect(source.onCommit).not.toHaveBeenCalled();
    expect(target.onCommit).not.toHaveBeenCalled();
    expect(source.wrapper.get(".tile").attributes("style")).toBe("height: 90px; left: 10px; top: 10px; width: 150px;");
  });

  test("#21 releasing over no grid commits in the item's own grid, with or without onTransfer", async () => {
    expect.hasAssertions();

    const onTransfer = vi.fn<(transfer: GridTransfer) => void>();
    const withTransfer = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }], onTransfer });
    const withoutTransfer = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    await flushPromises();
    // The page itself is under the pointer, which no grid claims
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([document.body]);
    // The release is past the grid's right edge, so the item is committed at the last column the grid clamps it to
    const dragPastEdge = async ({ wrapper }: ReturnType<typeof mountGrid>) => {
      const tile = wrapper.get(".tile");
      await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
      await tile.trigger("pointermove", {
        buttons: 1,
        clientX: gridWidth + cellPitch,
        clientY: spacing.padding,
        pointerId,
      });

      expect(wrapper.find(".placeholder").exists()).toBe(true);

      await tile.trigger("pointerup", { clientX: gridWidth + cellPitch, clientY: spacing.padding, pointerId });
    };
    await dragPastEdge(withTransfer);
    await dragPastEdge(withoutTransfer);

    expect(withTransfer.onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 10, y: 0 }] }]]);
    expect(withoutTransfer.onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 10, y: 0 }] }]]);
    expect(onTransfer).not.toHaveBeenCalled();
  });

  test("#21 releasing over its own grid commits", async () => {
    expect.hasAssertions();

    const onTransfer = vi.fn<(transfer: GridTransfer) => void>();
    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }], onTransfer });
    await flushPromises();
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", { buttons: 1, clientX: cellPitch * 2, clientY: 0, pointerId });
    await tile.trigger("pointerup", { clientX: cellPitch * 2, clientY: 0, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }] }]]);
    expect(onTransfer).not.toHaveBeenCalled();
  });

  test("#21 a resize never transfers", async () => {
    expect.hasAssertions();

    const onTransfer = vi.fn<(transfer: GridTransfer) => void>();
    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }], onTransfer });
    const target = mountGrid({ items: [] });
    await flushPromises();
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([target.wrapper.element]);
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: cellPitch, clientY: 0, pointerId });
    await handle.trigger("pointerup", { clientX: cellPitch, clientY: 0, pointerId });

    expect(onTransfer).not.toHaveBeenCalled();
    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 3, x: 0, y: 0 }] }]]);
  });

  test("#21 without onTransfer the item stays in its grid", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 0, y: 0 }] });
    const target = mountGrid({ items: [] });
    await flushPromises();
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([target.wrapper.element]);
    const tile = wrapper.get(".tile");
    await tile.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await tile.trigger("pointermove", {
      buttons: 1,
      clientX: cellPitch * 2 + spacing.padding,
      clientY: spacing.padding,
      pointerId,
    });

    expect(target.wrapper.find(".placeholder").exists()).toBe(false);

    await tile.trigger("pointerup", { clientX: cellPitch * 2 + spacing.padding, clientY: spacing.padding, pointerId });

    expect(target.onCommit).not.toHaveBeenCalled();
    expect(onCommit.mock.calls).toStrictEqual([[{ changes: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }] }]]);
  });
});
