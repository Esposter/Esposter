// @vitest-environment happy-dom
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Operation } from "@trpc/client";
import type { EffectScope } from "vue";

import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { errorLink } from "@/services/trpc/errorLink";
import { useAlertStore } from "@/store/alert";
import { RoutePath } from "@esposter/shared";
import { TRPCClientError } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { navigateTo, session, sessionScope } = vi.hoisted(() => ({
  navigateTo: vi.fn<(...args: Parameters<typeof import("#app/composables/router").navigateTo>) => void>(),
  session: { value: { data: null as null | { user: { id: string } }, isPending: false } },
  // The scope that was active where the link read the session, which is what decides whether the subscription
  // Better-auth opens is ever disposed
  sessionScope: { current: undefined as EffectScope | undefined },
}));

// The auto-imported `navigateTo` would really navigate — mock the module the auto-import points at rather than
// The global, which the resolved import never reads. The alert store is the real one, as in useMutation's suite
vi.mock(import("#app/composables/router"), async (importOriginal) => ({
  ...(await importOriginal()),
  navigateTo,
}));

vi.mock(import("@/services/auth/authClient"), async (importOriginal) => {
  const original = await importOriginal();
  const { getCurrentScope } = await import("vue");
  return {
    authClient: {
      useSession: () => {
        sessionScope.current = getCurrentScope();
        return session;
      },
    } as unknown as typeof original.authClient,
  };
});

describe(errorLink, () => {
  const message = "a";
  const userId = "b";

  const createTrpcClientError = (code: string) =>
    TRPCClientError.from<TRPCRouter>({ error: { code: -32001, data: { code }, message } });

  // Drives one rejection through the link exactly as the client does — the caller's own handler sees the error
  // Through the returned promise, which is where the double-alert question is asked
  const rejectThrough = async (code: string, isBackground = false) => {
    const error = createTrpcClientError(code);
    const link = errorLink({ op: { context: {} } });
    const operation: Operation = {
      context: { isBackground },
      id: 1,
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
    session.value = { data: { user: { id: userId } }, isPending: false };
    sessionScope.current = undefined;
  });

  // `useStore` registers its unsubscribe through `onScopeDispose`, which it only reaches when a scope is active,
  // And the link's error callback runs inside a promise where none is. Read bare, every rejection would leave
  // Another listener on the module-singleton session atom
  test("reads the session inside an effect scope, so the subscription it opens can be disposed", async () => {
    expect.hasAssertions();

    session.value = { data: null, isPending: false };
    await rejectThrough("UNAUTHORIZED");

    expect(sessionScope.current).toBeDefined();
  });

  test("alerts a background rejection it owns, because no caller alerts a code the link claims", async () => {
    expect.hasAssertions();

    // Declining every background op while `checkIsAlertedByErrorLink` still reports the code as the link's own
    // Leaves an attachment read the rate limiter rejects rolling the optimistic bubble back out of the room with
    // No toast from either side
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await rejectThrough("TOO_MANY_REQUESTS", true);

    expect(alerts.value).toHaveLength(1);
  });

  test("never moves a background rejection, so the hourly sweep cannot bounce the user to login", async () => {
    expect.hasAssertions();

    session.value = { data: null, isPending: false };
    await rejectThrough("FORBIDDEN", true);

    expect(navigateTo).not.toHaveBeenCalled();
  });

  test("holds an authenticated user in place when the session request has not resolved yet", async () => {
    expect.hasAssertions();

    // A pending session reads as `data: null`, which is not an absent session — redirecting on it logs a
    // Still-authenticated user out of the first page load that happens to reject
    session.value = { data: null, isPending: true };
    await rejectThrough("UNAUTHORIZED");

    expect(navigateTo).not.toHaveBeenCalled();
  });

  test("sends a settled sessionless caller to login", async () => {
    expect.hasAssertions();

    session.value = { data: null, isPending: false };
    await rejectThrough("UNAUTHORIZED");

    expect(navigateTo).toHaveBeenCalledWith(RoutePath.Login);
  });
});
