// @vitest-environment nuxt
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";

import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import PageBuilderEmailPreview from "@/components/PageBuilder/Email/Preview.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("pageBuilderEmailPreview", () => {
  const { trpcMsw } = setupMswTrpc();
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
});
