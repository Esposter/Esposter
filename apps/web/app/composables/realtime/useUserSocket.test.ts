// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { useUserSocket } from "@/composables/realtime/useUserSocket";
import { useSession } from "@/services/auth/authClient.test";
import { useConnectionStore } from "@/store/realtime/connection";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useUserSocket, () => {
  let wrapper: undefined | VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.restoreAllMocks();
  });

  // The session is read behind an await, which leaves no component instance after it, so a socket that subscribed
  // There would never open on a signed-in load
  test("opens the user socket on a signed-in load", async () => {
    expect.hasAssertions();

    const userId = v7();
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: { user: { id: userId } }, isPending: false }),
    );
    const connectionStore = useConnectionStore();
    const openUser = vi.spyOn(connectionStore, "openUser").mockReturnValue(undefined);
    vi.spyOn(connectionStore, "closeUser").mockReturnValue(undefined);
    wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          await useUserSocket();
          return () => h("div");
        },
      }),
    );
    await flushPromises();

    expect(openUser).toHaveBeenCalledTimes(1);
  });
});
