// @vitest-environment nuxt
import UiEmptyState from "#src/components/Ui/EmptyState.vue";
import UiErrorState from "#src/components/Ui/ErrorState.vue";
import UserApiKeysCardConfirmDeleteDialog from "#src/components/User/ApiKeysCard/ConfirmDeleteDialog.vue";
import UserApiKeysCard from "#src/components/User/ApiKeysCard/Index.vue";
import UserApiKeysCardRow from "#src/components/User/ApiKeysCard/Row.vue";
import UserSettingsListSkeleton from "#src/components/User/Settings/ListSkeleton.vue";
import { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";
import { apiKeyDelete, apiKeyList } from "#src/services/auth/authClient.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const mountCard = () => mountSuspended(UserApiKeysCard, { props: { section: UserSettingsPageSection.ApiKeys } });

describe("userApiKeysCard", () => {
  const apiKey = { createdAt: new Date(0), id: v7(), name: "a", permissions: null, start: "a" };

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

  // The key stays listed while its delete is out, and a refused delete leaves it listed rather than putting it back
  test("a delete keeps the key listed until the server answers, and a refused one leaves it listed", async () => {
    expect.hasAssertions();

    const { promise: heldDelete, resolve: answerDelete } = Promise.withResolvers<unknown>();
    const { promise: deleteReceived, resolve: onDeleteReceived } = Promise.withResolvers<void>();
    apiKeyList.mockResolvedValue({ data: { apiKeys: [apiKey] }, error: null });
    apiKeyDelete.mockImplementationOnce(async () => {
      onDeleteReceived();
      return heldDelete;
    });
    const component = await mountCard();
    await flushPromises();
    component.findComponent(UserApiKeysCardRow).vm.$emit("delete");
    await flushPromises();
    const deleting = component.findComponent(UserApiKeysCardConfirmDeleteDialog).props("deleteKey")();
    await deleteReceived;
    await flushPromises();

    expect(component.findAllComponents(UserApiKeysCardRow)).toHaveLength(1);

    answerDelete({ data: null, error: { message: " " } });
    await deleting;
    await flushPromises();

    expect(component.findAllComponents(UserApiKeysCardRow)).toHaveLength(1);
  });
});
