// @vitest-environment happy-dom
import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridItem } from "#src/models/GridItem";
import type { GridLayout } from "#src/models/GridLayout";
import type { GridSpacing } from "#src/models/GridSpacing";

import { useGridLayout } from "#src/composables/useGridLayout";
import { getColumnPitch } from "#src/placement/getColumnPitch";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
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

  // Mounts a grid whose tiles carry their geometry as inline styles, and whose handle resizes the item from its south-east
  // Corner, so a test reads where each one is drawn
  const mountGrid = ({
    columnNumber: gridColumnNumber = columnNumber,
    isEditable = true,
    items,
    spacing: gridSpacing = spacing,
  }: {
    columnNumber?: number;
    isEditable?: boolean;
    items: GridItem[];
    spacing?: GridSpacing;
  }) => {
    const onCommit = vi.fn<(changes: GridItem[]) => void>();
    const gridLayout = shallowRef<GridLayout>();
    // The items are held as a ref, so a test can replace them under a gesture the way a version restore does
    const itemsRef = shallowRef(items);
    const wrapper = mount(
      defineComponent({
        setup() {
          const root = useTemplateRef<HTMLElement>("root");
          const layout = useGridLayout(root, () => ({
            columnNumber: gridColumnNumber,
            dragStartDistance,
            isEditable,
            items: itemsRef.value,
            onCommit,
            rowHeight,
            spacing: gridSpacing,
          }));
          gridLayout.value = layout;
          const { placeholder, startGesture, startResize, tiles } = layout;

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
                        startResize(event, item);
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

    const setItems = (nextItems: GridItem[]) => {
      itemsRef.value = nextItems;
    };

    return { grid: gridLayout, onCommit, setItems, wrapper };
  };

  beforeEach(() => {
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

    expect(onCommit.mock.calls).toStrictEqual([[[{ h: 2, id: "a", w: 2, x: 2, y: 0 }]]]);
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

    expect(onCommit.mock.calls).toStrictEqual([[[{ h: 2, id: "a", w: 2, x: 2, y: 0 }]]]);
  });

  test("resizing from the south-east corner", async () => {
    expect.hasAssertions();

    const { onCommit, wrapper } = mountGrid({ items: [{ h: 2, id: "a", w: 2, x: 2, y: 0 }] });
    await flushPromises();
    const handle = wrapper.get(".handle");
    await handle.trigger("pointerdown", { clientX: 0, clientY: 0, pointerId });
    await handle.trigger("pointermove", { buttons: 1, clientX: cellPitch, clientY: rowPitch, pointerId });
    await handle.trigger("pointerup", { clientX: cellPitch, clientY: rowPitch, pointerId });

    expect(onCommit.mock.calls).toStrictEqual([[[{ h: 3, id: "a", w: 3, x: 2, y: 0 }]]]);
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

  test("the grid's height is its last row's bottom plus the padding on both sides", () => {
    expect.hasAssertions();

    const { grid } = mountGrid({ items: [{ h: 1, id: "a", w: 1, x: 0, y: 0 }], spacing: { gap: 10, padding: 20 } });

    expect(grid.value?.gridHeight.value).toBe(80);
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
