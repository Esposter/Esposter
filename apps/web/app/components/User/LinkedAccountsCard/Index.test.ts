// @vitest-environment nuxt
import { SocialProvider } from "#shared/models/auth/SocialProvider";
import UiErrorState from "#src/components/Ui/ErrorState.vue";
import UserLinkedAccountsCardConfirmUnlinkDialog from "#src/components/User/LinkedAccountsCard/ConfirmUnlinkDialog.vue";
import UserLinkedAccountsCard from "#src/components/User/LinkedAccountsCard/Index.vue";
import UserLinkedAccountsCardRow from "#src/components/User/LinkedAccountsCard/Row.vue";
import UserSettingsListSkeleton from "#src/components/User/Settings/ListSkeleton.vue";
import { UserSettingsPageSection } from "#src/models/user/UserSettingsPageSection";
import { listAccounts, unlinkAccount } from "#src/services/auth/authClient.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

const mountCard = () =>
  mountSuspended(UserLinkedAccountsCard, { props: { section: UserSettingsPageSection.LinkedAccounts } });

const findRow = (component: Awaited<ReturnType<typeof mountCard>>, provider: SocialProvider) =>
  component.findAllComponents(UserLinkedAccountsCardRow).find((row) => row.props("provider") === provider);

describe("userLinkedAccountsCard", () => {
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

    expect(component.findComponent(UiErrorState).exists()).toBe(false);
    expect(listAccounts).toHaveBeenCalledTimes(2);
  });

  // The account stays linked while its unlink is out, and a refused unlink leaves it linked
  test("an unlink keeps the account linked until the server answers, and a refused one leaves it linked", async () => {
    expect.hasAssertions();

    const provider = SocialProvider.Github;
    const { promise: heldUnlink, reject: refuseUnlink } = Promise.withResolvers<unknown>();
    const { promise: unlinkReceived, resolve: onUnlinkReceived } = Promise.withResolvers<void>();
    listAccounts.mockResolvedValue({ data: [{ id: "account", providerId: provider }], error: null });
    unlinkAccount.mockImplementationOnce(async () => {
      onUnlinkReceived();
      return heldUnlink;
    });
    const component = await mountCard();
    await flushPromises();
    findRow(component, provider)?.vm.$emit("unlink");
    await flushPromises();
    const unlinking = component.findComponent(UserLinkedAccountsCardConfirmUnlinkDialog).props("unlink")();
    await unlinkReceived;
    await flushPromises();

    expect(findRow(component, provider)?.props("isLinked")).toBe(true);

    refuseUnlink(new Error(" "));
    await unlinking;
    await flushPromises();

    expect(findRow(component, provider)?.props("isLinked")).toBe(true);
  });
});
