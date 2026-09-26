// @vitest-environment happy-dom
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Operation } from "@trpc/client";

import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { getSession } from "@/services/auth/authClient.test";
import { errorLink } from "@/services/trpc/errorLink";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";
import { TRPCClientError } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { navigateTo } = vi.hoisted(() => ({
  navigateTo: vi.fn<(...args: Parameters<typeof import("#app/composables/router").navigateTo>) => void>(),
}));

// The auto-imported `navigateTo` would really navigate — mock the module the auto-import points at rather than
// The global, which the resolved import never reads. The alert store is the real one, as in useMutation's suite
vi.mock(import("#app/composables/router"), async (importOriginal) => ({
  ...(await importOriginal()),
  navigateTo,
}));

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(errorLink, () => {
  const message = "";
  const userId = crypto.randomUUID();

  const createTrpcClientError = (code: string) =>
    TRPCClientError.from<TRPCRouter>({ error: { code: -32001, data: { code }, message } });

  // Drives one rejection through the link exactly as the client does — the caller's own handler sees the error
  // Through the returned promise, which is where the double-alert question is asked
  const rejectThrough = async (code: string, isBackground = false) => {
    const error = createTrpcClientError(code);
    const link = errorLink({ op: { context: {} } });
    const operation: Operation = {
      context: { isBackground },
      id: 0,
      input: undefined,
      path: "",
      signal: null,
      type: "query",
    };
    await new Promise<void>((resolve) => {
      link({
        next: () =>
          observable((observer) => {
            observer.error(error);
          }),
        op: operation,
      }).subscribe({
        error: () => {
          resolve();
        },
      });
    });
    // The link's error callback is wrapped in `getSynchronizedFunction`, so its own registry is the completion
    // Signal — the rejection reaches the subscriber before the callback has finished deciding what to do with it
    await waitForSynchronizedFunctions();
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    navigateTo.mockClear();
    getSession.mockResolvedValue({ data: { user: { id: userId } }, error: null });
  });

  test("alerts a background rejection it owns, because no caller alerts a code the link claims", async () => {
    expect.hasAssertions();

    // Declining every background op while `checkIsAnsweredByErrorLink` still reports the code as the link's own
    // Leaves an attachment read the rate limiter rejects rolling the optimistic bubble back out of the room with
    // No toast from either side
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await rejectThrough("TOO_MANY_REQUESTS", true);

    expect(alerts.value).toHaveLength(1);
  });

  test("never moves a background rejection, so the hourly sweep cannot bounce the user to login", async () => {
    expect.hasAssertions();

    getSession.mockResolvedValue({ data: null, error: null });
    await rejectThrough("FORBIDDEN", true);

    expect(navigateTo).not.toHaveBeenCalled();
  });

  // The server refuses a signed-in caller what it may not do under the same codes
  test("holds a caller the server still finds signed in", async () => {
    expect.hasAssertions();

    await rejectThrough("UNAUTHORIZED");

    expect(navigateTo).not.toHaveBeenCalled();
  });

  // Callers leave a missing session to the link, so one it sends nobody to login for is alerted by nobody else
  test("alerts a missing session it holds in place because the session cannot be read", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    getSession.mockResolvedValue({ data: null, error: { status: 500 } });
    await rejectThrough("UNAUTHORIZED");

    expect(navigateTo).not.toHaveBeenCalled();
    expect(alerts.value).toHaveLength(1);
  });

  // The client's own session store would still read signed in here, once the session has expired on the server
  test("sends a caller the server finds no session for to login", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    getSession.mockResolvedValue({ data: null, error: null });
    await rejectThrough("UNAUTHORIZED");

    expect(navigateTo).toHaveBeenCalledExactlyOnceWith(RoutePath.Login);
    expect(alerts.value).toHaveLength(0);
  });
});
