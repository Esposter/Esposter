// @vitest-environment nuxt
import { useAdminActionMap } from "@/composables/message/moderation/useAdminActionMap";
import { useSession } from "@/services/auth/authClient.test";
import { useAlertStore } from "@/store/alert";
import { AdminActionType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useAdminActionMap, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: { user: { id: userId } } }),
    );
  });

  // The alert store is the one surface App.vue actually renders — a notice sent anywhere else tells a member
  // Who was warned, kicked or timed out nothing at all
  test("alerts the member an action was taken against", async () => {
    expect.hasAssertions();

    const adminActionMap = useAdminActionMap();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await adminActionMap[AdminActionType.Warn]?.(roomId);

    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["You have been warned."]);
  });
});
