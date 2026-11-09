// @vitest-environment nuxt
import UiErrorState from "@/components/Ui/ErrorState.vue";
import UserLinkedAccountsCard from "@/components/User/LinkedAccountsCard/Index.vue";
import UserLinkedAccountsCardRow from "@/components/User/LinkedAccountsCard/Row.vue";
import UserSettingsListSkeleton from "@/components/User/Settings/ListSkeleton.vue";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { listAccounts } from "@/services/auth/authClient.test";
import { LoginButtonItems } from "@/services/login/LoginButtonItems";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("userLinkedAccountsCard", () => {
  const mountCard = () =>
    mountSuspended(UserLinkedAccountsCard, { props: { section: UserSettingsPageSection.LinkedAccounts } });

  test("draws the loading rows while the accounts are out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    listAccounts.mockImplementationOnce(async () => {
      await readGate;
      return { data: [], error: null };
    });
    const component = await mountCard();

    expect(component.findComponent(UserSettingsListSkeleton).exists()).toBe(true);
    expect(component.findComponent(UserLinkedAccountsCardRow).exists()).toBe(false);

    releaseRead();
    await flushPromises();
  });

  test("a failed read draws the error state, and its retry reads the accounts again", async () => {
    expect.hasAssertions();

    listAccounts
      .mockResolvedValueOnce({ data: null, error: { message: " " } })
      .mockResolvedValueOnce({ data: [], error: null });
    const component = await mountCard();
    await flushPromises();

    expect(component.findComponent(UiErrorState).exists()).toBe(true);

    await component.findComponent(UiErrorState).get("button").trigger("click");
    await flushPromises();

    expect(component.findAllComponents(UserLinkedAccountsCardRow)).toHaveLength(LoginButtonItems.length);
  });
});
