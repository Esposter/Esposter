// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { useReadData } from "@/composables/useReadData";
import { useSession } from "@/services/auth/authClient.test";
import { useAlertStore } from "@/store/alert";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCClientError } from "@trpc/client";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useReadData, () => {
  const message = "";
  const userId = v7();
  const session = ref<null | { user: { id: string } }>(null);
  let wrapper: undefined | VueWrapper;

  const createTrpcClientError = (code: string) =>
    TRPCClientError.from<never>({ error: { code: -32_603, data: { code }, message } });

  // A guest at mount, so the signed-in reader is not called until the session appears
  const mountReadData = async (authedReader: () => never) => {
    wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          await useReadData(noop, authedReader);
          return () => h("div");
        },
      }),
    );
    await flushPromises();
  };

  beforeEach(() => {
    useSession.mockReturnValue({ data: session });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    session.value = null;
  });

  test("alerts a signed-in read that fails once the session appears", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await mountReadData(() => {
      throw createTrpcClientError("INTERNAL_SERVER_ERROR");
    });
    session.value = { user: { id: userId } };
    await flushPromises();

    expect(alerts.value).toHaveLength(1);
  });

  // The error link alerts a code it answers itself, so a read failing with one must not stack a second toast here
  test("leaves a code the error link answers to the link", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await mountReadData(() => {
      throw createTrpcClientError("BAD_REQUEST");
    });
    session.value = { user: { id: userId } };
    await flushPromises();

    expect(alerts.value).toHaveLength(0);
  });
});
