import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import PageBuilderCanvasFrame from "@/components/PageBuilder/Canvas/Frame.vue";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { render } from "@nuxt/test-utils/browser";
import { assert, describe, expect, test, vi } from "vitest";
import { defineComponent, h, shallowRef, Teleport } from "vue";

describe("PageBuilderCanvasFrame", () => {
  // constants.test declares a suite when imported, which only the default run holds, so the values are declared here
  const TEST_CONTEXT = { origin: "https://esposter.test" };
  const TEST_ID = "a";
  const TEST_ROOT = { props: { lang: "en" } };

  test("switching to tablet draws the page at tablet width", async () => {
    expect.hasAssertions();

    const screen = await render(PageBuilderCanvasFrame, {
      attrs: { style: { height: "400px", width: "1024px" } },
      props: {
        css: "@media (max-width: 991px) { .probe { display: none } }",
        device: PageBuilderDevice.Tablet,
        title: "Page",
      },
      slots: { default: () => h("div", { class: "probe" }) },
    });
    const frame = screen.container.querySelector("iframe");
    assert.exists(frame);
    const probe = await vi.waitFor(() => {
      const element = frame.contentDocument?.querySelector<HTMLElement>(".probe");
      assert.exists(element);
      expect(getComputedStyle(element).display).toBe("none");
      return element;
    });

    expect(frame.contentWindow?.innerWidth).toBe(768);
    expect(getComputedStyle(probe).display).toBe("none");
  });

  test("a narrow pane scales the desktop canvas down", async () => {
    expect.hasAssertions();

    const screen = await render(PageBuilderCanvasFrame, {
      attrs: { style: { height: "400px", width: "600px" } },
      props: { css: "", device: PageBuilderDevice.Desktop, title: "Page" },
    });
    const frame = screen.container.querySelector("iframe");
    assert.exists(frame);
    await expect.poll(() => frame.getBoundingClientRect().width).toBeCloseTo(600, 0);

    expect(frame.contentWindow?.innerWidth).toBe(992);
  });

  test("a page's body style does not restyle the editor", async () => {
    expect.hasAssertions();

    const screen = await render(PageBuilderCanvasFrame, {
      attrs: { style: { height: "400px", width: "1024px" } },
      props: { css: "body { background-color: rgb(255, 0, 0) }", device: PageBuilderDevice.Desktop, title: "Page" },
    });
    const frame = screen.container.querySelector("iframe");
    assert.exists(frame);
    await expect
      .poll(() => frame.contentDocument && getComputedStyle(frame.contentDocument.body).backgroundColor)
      .toBe("rgb(255, 0, 0)");

    expect(getComputedStyle(document.body).backgroundColor).not.toBe("rgb(255, 0, 0)");
  });

  test("a script inside a custom html block does not run in the canvas", async () => {
    expect.hasAssertions();

    const html = `<script>document.title = "changed"</script><p>kept</p><img src="x" onerror="document.title='changed'">`;
    const screen = await render(PageBuilderCanvasFrame, {
      attrs: { style: { height: "400px", width: "1024px" } },
      props: { css: "", device: PageBuilderDevice.Desktop, title: "Page" },
      slots: {
        default: () =>
          renderCanvasVNodes(
            { content: [{ props: { html, id: TEST_ID }, type: WebpageNodeType.CustomHtml }], root: TEST_ROOT },
            TEST_CONTEXT,
          ),
      },
    });
    const frame = screen.container.querySelector("iframe");
    assert.exists(frame);
    await expect.poll(() => frame.contentDocument?.querySelector("p")?.textContent).toBe("kept");

    expect(frame.contentDocument?.title).not.toBe("changed");
    expect(document.title).not.toBe("changed");
  });

  test("listeners from the app still fire inside a sandboxed frame", async () => {
    expect.hasAssertions();

    const onClick = vi.fn<() => void>();
    const SandboxedFrame = defineComponent({
      setup(_props, { slots }) {
        const frameBody = shallowRef<HTMLElement>();
        const onLoad = (event: Event) => {
          frameBody.value = (event.target as HTMLIFrameElement).contentDocument?.body;
        };

        return () =>
          h("div", [
            h("iframe", {
              onLoad,
              sandbox: "allow-same-origin",
              srcdoc: "<!doctype html><html><head></head><body></body></html>",
            }),
            frameBody.value ? h(Teleport, { to: frameBody.value }, slots.default?.()) : null,
          ]);
      },
    });
    const screen = await render(SandboxedFrame, { slots: { default: () => h("button", { onClick }, "Press") } });
    const frame = screen.container.querySelector("iframe");
    assert.exists(frame);
    await expect.poll(() => frame.contentDocument?.querySelector("button")).not.toBeNull();
    frame.contentDocument?.querySelector<HTMLButtonElement>("button")?.click();

    expect(onClick).toHaveBeenCalledOnce();
  });
});
