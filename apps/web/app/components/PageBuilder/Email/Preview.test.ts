// @vitest-environment nuxt
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";

import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import PageBuilderEmailPreview from "@/components/PageBuilder/Email/Preview.vue";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { MjmlNodeType } from "mjml-blocks";
import http from "node:http";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("pageBuilderEmailPreview", () => {
  const { server, trpcMsw } = setupMswTrpc();
  // Hooks after run last-in first-out, so this runs before the harness's afterEach, which waits a turn on setTimeout
  afterEach(() => {
    vi.useRealTimers();
  });
  const html = "a";
  const message = "a";
  const emailDocument: EmailDocument = { content: [], root: { props: {} } };

  test("preview shows the compiled email at mobile width", async () => {
    expect.hasAssertions();

    trpcMsw.email.compile.mutation(() => ({ html }));
    const wrapper = await mountSuspended(PageBuilderEmailPreview, {
      props: { device: PageBuilderDevice.Mobile, emailDocument },
    });
    await waitForSynchronizedFunctions();
    await flushPromises();

    const frame = wrapper.find<HTMLIFrameElement>("iframe");

    expect(frame.attributes("srcdoc")).toBe(html);
    expect(frame.element.style.width).toBe(`${DEVICE_WIDTH_MAP[PageBuilderDevice.Mobile]}px`);
    wrapper.unmount();
  });

  test("validator messages show above the preview", async () => {
    expect.hasAssertions();

    trpcMsw.email.compile.mutation(() => ({ message }));
    const wrapper = await mountSuspended(PageBuilderEmailPreview, {
      props: { device: PageBuilderDevice.Desktop, emailDocument },
    });
    await waitForSynchronizedFunctions();
    await flushPromises();

    const alert = wrapper.find('[role="alert"]');

    expect(alert.text()).toBe(message);
    expect(wrapper.element.firstElementChild).toBe(alert.element);
    wrapper.unmount();
  });

  test("the preview frame is sandboxed to scripts with no same-origin access", async () => {
    expect.hasAssertions();

    trpcMsw.email.compile.mutation(() => ({ html }));
    const wrapper = await mountSuspended(PageBuilderEmailPreview, {
      props: { device: PageBuilderDevice.Desktop, emailDocument },
    });
    await waitForSynchronizedFunctions();
    await flushPromises();

    expect(wrapper.find("iframe").attributes("sandbox")).toBe("allow-scripts");
    wrapper.unmount();
  });

  test("a long email previews as a short one", async () => {
    expect.hasAssertions();

    // Long enough that a query would carry the document in its request line, past the server's header limit
    const longText = "a".repeat(http.maxHeaderSize);
    const longEmailDocument: EmailDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        content: {
                          content: [{ content: [{ text: longText, type: "text" }], type: "paragraph" }],
                          type: "doc",
                        },
                        id: crypto.randomUUID(),
                      },
                      type: MjmlNodeType.Text,
                    },
                  ],
                  id: crypto.randomUUID(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: crypto.randomUUID(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: {} },
    };
    const compile = vi.fn<(input: unknown) => void>();
    const requests: Request[] = [];
    const onRequestStart = ({ request }: { request: Request }) => {
      requests.push(request);
    };
    trpcMsw.email.compile.mutation(({ input }) => {
      compile(input);
      return { html };
    });
    server.events.on("request:start", onRequestStart);
    const wrapper = await mountSuspended(PageBuilderEmailPreview, {
      props: { device: PageBuilderDevice.Desktop, emailDocument: longEmailDocument },
    });
    await waitForSynchronizedFunctions();
    await flushPromises();
    server.events.removeListener("request:start", onRequestStart);

    expect(encodeURIComponent(JSON.stringify(longEmailDocument)).length).toBeGreaterThan(http.maxHeaderSize);
    expect(requests.map(({ method, url }) => ({ method, url }))).toStrictEqual([
      { method: "POST", url: `${window.location.origin}${TRPC_CLIENT_PATH}/email.compile` },
    ]);
    expect(compile).toHaveBeenCalledExactlyOnceWith(longEmailDocument);
    expect(wrapper.find("iframe").attributes("srcdoc")).toBe(html);
    wrapper.unmount();
  });

  test("a run of edits compiles once", async () => {
    expect.hasAssertions();

    trpcMsw.email.compile.mutation(() => ({ html }));
    const wrapper = await mountSuspended(PageBuilderEmailPreview, {
      props: { device: PageBuilderDevice.Desktop, emailDocument },
    });
    await waitForSynchronizedFunctions();
    await flushPromises();

    // The mount's compile is answered above, so this resolver counts only the requests the edits make
    const { promise: isCompiled, resolve: signalCompiled } = Promise.withResolvers<void>();
    const compile = vi.fn<(input: unknown) => void>();
    trpcMsw.email.compile.mutation(({ input }) => {
      compile(input);
      signalCompiled();
      return { html };
    });
    const edits = ["a", "aa", "aaa"].map((preview) => ({ ...emailDocument, root: { props: { preview } } }));
    // oxlint-disable-next-line testing/no-faked-set-timeout -- the afterEach above restores the real clock before the harness waits a turn on setTimeout
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    for (const edit of edits)
      // oxlint-disable-next-line no-await-in-loop -- each edit is its own watcher flush, the way a keystroke is
      await wrapper.setProps({ emailDocument: edit });

    await vi.advanceTimersByTimeAsync(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    await isCompiled;
    await flushPromises();

    expect(compile).toHaveBeenCalledExactlyOnceWith(takeOne(edits, edits.length - 1));
    wrapper.unmount();
  });
});
