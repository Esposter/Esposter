// @vitest-environment nuxt
import { usePushSubscription } from "#src/composables/usePushSubscription";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, onTestFinished, test, vi } from "vitest";

const notificationPermission = shallowRef<PermissionState>();
mockNuxtImport("usePermission", () => () => notificationPermission);

describe(usePushSubscription, () => {
  const { trpcMsw } = setupMswTrpc();

  // A subscription made under a VAPID key the server no longer signs with is refused every push, so it is replaced
  test("replaces a subscription made under another VAPID key", async () => {
    expect.hasAssertions();

    const staleSubscription = {
      endpoint: "https://stale.",
      options: { applicationServerKey: new Uint8Array([1]).buffer },
      unsubscribe: vi.fn<() => Promise<boolean>>(),
    };
    const freshSubscription = { toJSON: () => ({ endpoint: "https://fresh.", keys: { auth: "", p256dh: "" } }) };
    const pushManager = {
      getSubscription: vi.fn<() => Promise<typeof staleSubscription>>(() => Promise.resolve(staleSubscription)),
      subscribe: vi.fn<(options: PushSubscriptionOptionsInit) => Promise<typeof freshSubscription>>(() =>
        Promise.resolve(freshSubscription),
      ),
    };
    // The test document has no service worker, so the one this test drives is defined for it alone
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: { ready: Promise.resolve({ pushManager }) },
    });
    onTestFinished(() => {
      Reflect.deleteProperty(window.navigator, "serviceWorker");
    });
    const unsubscribedEndpoints: string[] = [];
    const subscribedEndpoints: string[] = [];
    trpcMsw.pushSubscription.unsubscribe.mutation(({ input }) => {
      unsubscribedEndpoints.push(input);
    });
    trpcMsw.pushSubscription.subscribe.mutation(({ input }) => {
      subscribedEndpoints.push(input.endpoint);
      // oxlint-disable-next-line no-restricted-syntax -- the response is not read by the composable
      return {} as never;
    });
    await mountSuspended(
      defineComponent({
        setup() {
          usePushSubscription();
          return () => h("div");
        },
      }),
    );
    notificationPermission.value = "granted";
    await nextTick();
    await waitForSynchronizedFunctions();

    expect(unsubscribedEndpoints).toStrictEqual([staleSubscription.endpoint]);
    expect(staleSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(pushManager.subscribe).toHaveBeenCalledExactlyOnceWith({
      applicationServerKey: useRuntimeConfig().public.vapid.publicKey,
      userVisibleOnly: true,
    });
    expect(subscribedEndpoints).toStrictEqual(["https://fresh."]);
  });
});
