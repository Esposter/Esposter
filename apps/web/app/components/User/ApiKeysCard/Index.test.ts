// @vitest-environment nuxt
import UiEmptyState from "@/components/Ui/EmptyState.vue";
import UiErrorState from "@/components/Ui/ErrorState.vue";
import UserApiKeysCard from "@/components/User/ApiKeysCard/Index.vue";
import UserApiKeysCardRow from "@/components/User/ApiKeysCard/Row.vue";
import UserSettingsListSkeleton from "@/components/User/Settings/ListSkeleton.vue";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { apiKeyList } from "@/services/auth/authClient.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("userApiKeysCard", () => {
  const apiKey = { createdAt: new Date(0), id: crypto.randomUUID(), name: "a", permissions: null, start: "a" };
  const mountCard = () => mountSuspended(UserApiKeysCard, { props: { section: UserSettingsPageSection.ApiKeys } });

  test("draws the loading rows while the keys are out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    apiKeyList.mockImplementationOnce(async () => {
      await readGate;
      return { data: { apiKeys: [] }, error: null };
    });
    const component = await mountCard();

    expect(component.findComponent(UserSettingsListSkeleton).exists()).toBe(true);
    expect(component.findComponent(UiEmptyState).exists()).toBe(false);

    releaseRead();
    await flushPromises();
  });

  test("a failed read draws the error state, and its retry reads the keys again", async () => {
    expect.hasAssertions();

    apiKeyList
      .mockResolvedValueOnce({ data: null, error: { message: " " } })
      .mockResolvedValueOnce({ data: { apiKeys: [apiKey] }, error: null });
    const component = await mountCard();
    await flushPromises();

    expect(component.findComponent(UiErrorState).exists()).toBe(true);

    await component.findComponent(UiErrorState).get("button").trigger("click");
    await flushPromises();

    expect(component.findAllComponents(UserApiKeysCardRow)).toHaveLength(1);
  });

  test("a read that holds no keys says so", async () => {
    expect.hasAssertions();

    apiKeyList.mockResolvedValueOnce({ data: { apiKeys: [] }, error: null });
    const component = await mountCard();
    await flushPromises();

    expect(component.findComponent(UiEmptyState).props("title")).toBe("No API keys");
  });
});
