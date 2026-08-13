// @vitest-environment nuxt
import { useAdminActionMap } from "@/composables/message/moderation/useAdminActionMap";
import { useAlertStore } from "@/store/alert";
import { AdminActionType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";
// AuthClient is a better-auth dynamic-path Proxy, so useSession is not a configurable own property and cannot
// Be spied on directly — mock the module and drive useSession through a hoisted mock instead
const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<(fetcher?: unknown) => unknown>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe(useAdminActionMap, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
    useSessionMock.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: { user: { id: userId } } }),
    );
  });

  // The notices went to a snackbar component nothing ever mounted, so a member who was warned, kicked or timed
  // Out was told nothing at all. The alert store is the one surface App.vue actually renders
  test("alerts the member an action was taken against", async () => {
    expect.hasAssertions();

    const adminActionMap = useAdminActionMap();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await adminActionMap[AdminActionType.Warn]?.(roomId);

    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["You have been warned."]);
  });
});
