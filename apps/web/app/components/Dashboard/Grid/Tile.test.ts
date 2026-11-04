// @vitest-environment happy-dom
import DashboardGridTile from "@/components/Dashboard/Grid/Tile.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { ResizeEdge } from "vue-grid-layout-headless";

describe("dashboardGridTile", () => {
  const geometry = { height: 80, left: 10, top: 10, width: 160 };
  const label = "Bar visual";
  const createTile = (props: object = {}) =>
    mount(DashboardGridTile, {
      props: {
        geometry,
        isAutoHeight: false,
        isDragged: false,
        isEditable: true,
        label,
        offset: { x: 0, y: 0 },
        ...props,
      },
      slots: { default: "<button>Inside</button>" },
    });

  describe.each(Object.values(ResizeEdge))("%s handle", (edge) => {
    test("a press on the handle starts a resize from that edge or corner", async () => {
      expect.hasAssertions();

      const wrapper = createTile();
      await wrapper.get(`[data-edge="${edge}"]`).trigger("pointerdown", { button: 0 });

      expect(wrapper.emitted("press")?.map(([, emittedEdge]) => emittedEdge)).toStrictEqual([edge]);
    });
  });

  test("a touch press on a handle emits the press without its edge, and a mouse press keeps it", async () => {
    expect.hasAssertions();

    const wrapper = createTile();
    const handle = wrapper.get(`[data-edge="${ResizeEdge.East}"]`);
    await handle.trigger("pointerdown", { button: 0, pointerType: "touch" });
    await handle.trigger("pointerdown", { button: 0, pointerType: "mouse" });

    expect(wrapper.emitted("press")?.map(([, emittedEdge]) => emittedEdge)).toStrictEqual([undefined, ResizeEdge.East]);
  });

  test("an auto-height tile draws only its east and west handles, since its height is its content's", () => {
    expect.hasAssertions();

    const wrapper = createTile({ isAutoHeight: true });

    expect(wrapper.findAll(".dashboard-grid-handle").map((handle) => handle.attributes("data-edge"))).toStrictEqual([
      "East",
      "West",
    ]);
  });

  test("an editable tile is marked for its outline, and a read-only tile is not", () => {
    expect.hasAssertions();

    expect(createTile().attributes("data-editable")).toBe("true");
    expect(createTile({ isEditable: undefined }).attributes("data-editable")).toBeUndefined();
  });

  test("a read-only tile has no handles and no tab stop", () => {
    expect.hasAssertions();

    const wrapper = createTile({ isEditable: undefined });

    expect(wrapper.findAll(".dashboard-grid-handle")).toHaveLength(0);
    expect(wrapper.attributes("tabindex")).toBeUndefined();
  });

  test("an editable tile is a tab stop named after its visual", () => {
    expect.hasAssertions();

    const wrapper = createTile();

    expect({
      "aria-label": wrapper.attributes("aria-label"),
      role: wrapper.attributes("role"),
      tabindex: wrapper.attributes("tabindex"),
    }).toStrictEqual({ "aria-label": label, role: "group", tabindex: "0" });
  });

  test("the arrow keys move a focused visual one cell, and Shift with an arrow resizes it", async () => {
    expect.hasAssertions();

    const wrapper = createTile();
    await wrapper.trigger("keydown", { key: "ArrowRight" });
    await wrapper.trigger("keydown", { key: "ArrowDown", shiftKey: true });

    expect(wrapper.emitted("step")).toStrictEqual([[{ dx: 1 }], [{ dh: 1 }]]);
  });

  test("enter opens a focused visual", async () => {
    expect.hasAssertions();

    const wrapper = createTile();
    await wrapper.trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("open")).toHaveLength(1);
  });

  test("a key pressed on a control inside the visual steps nothing", async () => {
    expect.hasAssertions();

    const wrapper = createTile();
    await wrapper.get("button").trigger("keydown", { key: "ArrowRight" });
    await wrapper.get("button").trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("step")).toBeUndefined();
    expect(wrapper.emitted("open")).toBeUndefined();
  });

  test("an auto-height visual reports the height its content draws", () => {
    expect.hasAssertions();

    const observe = vi.fn<(callback: ResizeObserverCallback) => void>();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          observe(callback);
        }

        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
    const wrapper = createTile({ isAutoHeight: true });
    const [callback] = observe.mock.calls.map(([emittedCallback]) => emittedCallback);
    callback?.([{ contentRect: { height: 120 } }] as ResizeObserverEntry[], {} as ResizeObserver);

    expect(wrapper.emitted("measure")).toStrictEqual([[120]]);
    vi.unstubAllGlobals();
  });
});
