import type { VueWrapper } from "@vue/test-utils";
import type { VNodeChild } from "vue";

import { useCanvasFrame } from "#src/composables/useCanvasFrame";
import { CANVAS_FRAME_SRCDOC } from "#src/services/constants";
import { mount } from "@vue/test-utils";
import { describe, expect, onTestFinished, test, vi } from "vitest";
import { defineComponent, h, nextTick, shallowRef, Teleport } from "vue";

describe(useCanvasFrame, () => {
  // A frame in a fixed-size pane, with the page's markup teleported into the frame's body from the default slot
  const CanvasFrameTest = defineComponent({
    props: {
      css: { default: "", type: String },
      fill: { default: false, type: Boolean },
      paneWidth: { required: true, type: Number },
      width: { required: true, type: Number },
    },
    render() {
      return h("div", { style: { height: "400px", width: `${this.paneWidth}px` } }, [
        h("div", { ref: "pane", style: { height: "100%", width: "100%" } }, [
          h("iframe", {
            ref: "frame",
            sandbox: "allow-same-origin",
            srcdoc: CANVAS_FRAME_SRCDOC,
            style: [{ border: "0" }, this.frameStyle],
          }),
          this.frameBody ? h(Teleport, { to: this.frameBody }, this.$slots.default?.() ?? []) : undefined,
        ]),
      ]);
    },
    setup(props) {
      const frame = shallowRef<HTMLIFrameElement>();
      const pane = shallowRef<HTMLElement>();
      const { frameBody, frameStyle, loaded } = useCanvasFrame({
        css: () => props.css,
        fill: () => props.fill,
        frame,
        pane,
        width: () => props.width,
      });
      return { frame, frameBody, frameStyle, loaded, pane };
    },
  });

  const mountCanvasFrame = (
    props: { css?: string; fill?: boolean; paneWidth: number; width: number },
    slotContent?: () => VNodeChild,
  ): VueWrapper<InstanceType<typeof CanvasFrameTest>> => {
    const wrapper = mount(CanvasFrameTest, {
      attachTo: document.body,
      props,
      slots: slotContent ? { default: slotContent } : undefined,
    });
    onTestFinished(() => {
      wrapper.unmount();
    });
    return wrapper;
  };

  // Waits for the frame's first load, then for the render it causes, then for the next animation frame.
  // That frame is the one the composable writes the page's css in
  const settleFrame = async (wrapper: VueWrapper<InstanceType<typeof CanvasFrameTest>>): Promise<HTMLIFrameElement> => {
    await wrapper.vm.loaded;
    await nextTick();
    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
    return wrapper.find("iframe").element;
  };

  test("a desktop frame is never narrower than its least width", async () => {
    expect.hasAssertions();
    const frame = await settleFrame(mountCanvasFrame({ fill: true, paneWidth: 600, width: 992 }));
    expect(frame.contentWindow?.innerWidth).toBe(992);
    expect(frame.getBoundingClientRect().width).toBeCloseTo(600, 0);
  });

  test("a tablet frame draws at its fixed width", async () => {
    expect.hasAssertions();
    const frame = await settleFrame(mountCanvasFrame({ fill: false, paneWidth: 1024, width: 768 }));
    expect(frame.contentWindow?.innerWidth).toBe(768);
  });

  test("a page's body style does not restyle the editor", async () => {
    expect.hasAssertions();
    const frame = await settleFrame(
      mountCanvasFrame({ css: "body { background-color: rgb(255, 0, 0) }", paneWidth: 600, width: 992 }),
    );
    expect(frame.contentDocument && getComputedStyle(frame.contentDocument.body).backgroundColor).toBe(
      "rgb(255, 0, 0)",
    );
    expect(getComputedStyle(document.body).backgroundColor).not.toBe("rgb(255, 0, 0)");
  });

  test("a script inside a custom HTML block does not run in the canvas", async () => {
    expect.hasAssertions();
    const frame = await settleFrame(
      mountCanvasFrame({ paneWidth: 600, width: 992 }, () =>
        h("div", { innerHTML: "<p>kept</p><script>document.title = 'ran'</script>" }),
      ),
    );
    expect(frame.contentDocument?.title).toBe("");
    expect(frame.contentDocument?.body.querySelector("p")?.textContent).toBe("kept");
  });

  test("listeners from the host still fire inside the frame", async () => {
    expect.hasAssertions();
    const onClick = vi.fn<() => void>();
    const frame = await settleFrame(
      mountCanvasFrame({ paneWidth: 600, width: 992 }, () => h("button", { onClick }, "press")),
    );
    frame.contentDocument?.querySelector("button")?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
