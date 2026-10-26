// @vitest-environment nuxt
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import UserDeleteAccountCard from "@/components/User/DeleteAccountCard/Index.vue";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { useSession } from "@/services/auth/authClient.test";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { AccountDeletionKeptItems } from "@/services/user/settings/AccountDeletionKeptItems";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));
vi.mock(import("@/services/auth/signOutOfBrowser"));

const getDialog = () => {
  const dialog = document.body.querySelector<HTMLElement>('[role="alertdialog"]');
  assert.exists(dialog);
  return dialog;
};
const getConfirmButton = () => {
  const button = getDialog().querySelector<HTMLButtonElement>('button[data-variant="Danger"]');
  assert.exists(button);
  return button;
};
const typeName = (value: string) => {
  const input = getDialog().querySelector<HTMLInputElement>("input");
  assert.exists(input);
  input.value = value;
  input.dispatchEvent(new Event("input"));
};

describe("userDeleteAccountCard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const { trpcMsw } = setupMswTrpc();
  const name = "name";
  const mountCard = () => {
    useSession.mockReturnValue({ data: ref({ user: { name } }) });
    return mountSuspended(UserDeleteAccountCard, {
      attachTo: document.body,
      props: { section: UserSettingsPageSection.DeleteAccount },
    });
  };

  test("does not delete on a click alone", async () => {
    expect.hasAssertions();

    const deleteAccount = vi.fn<() => void>();
    trpcMsw.user.deleteAccount.mutation(deleteAccount);
    const component = await mountCard();
    await component.get("button").trigger("click");
    await flushPromises();

    expect(getConfirmButton().disabled).toBe(true);
    getConfirmButton().click();
    await flushPromises();

    expect(deleteAccount).not.toHaveBeenCalled();
  });

  test("deletes only once the typed name matches the display name", async () => {
    expect.hasAssertions();

    const { promise: isSignedOut, resolve: onSignedOut } = Promise.withResolvers<void>();
    const deleteAccount = vi.fn<() => void>();
    trpcMsw.user.deleteAccount.mutation(deleteAccount);
    vi.mocked(signOutOfBrowser).mockImplementation(() => {
      onSignedOut();
      return Promise.resolve();
    });
    const component = await mountCard();
    await component.get("button").trigger("click");
    await flushPromises();

    // The match is exact, so the name with a trailing space is not it
    typeName(`${name} `);
    await flushPromises();
    getConfirmButton().click();
    await flushPromises();

    expect(deleteAccount).not.toHaveBeenCalled();

    typeName(name);
    await flushPromises();
    getConfirmButton().click();
    await isSignedOut;

    expect(deleteAccount).toHaveBeenCalledTimes(1);
    expect(signOutOfBrowser).toHaveBeenCalledExactlyOnceWith(RoutePath.Login);
  });

  test("names what the deletion keeps", async () => {
    expect.hasAssertions();

    const component = await mountCard();
    await component.get("button").trigger("click");
    await flushPromises();

    expect(Array.from(getDialog().querySelectorAll("li"), ({ textContent }) => textContent.trim())).toStrictEqual(
      AccountDeletionKeptItems.map(({ title }) => title),
    );
  });

  test("stays open and does not sign out when the deletion fails", async () => {
    expect.hasAssertions();

    trpcMsw.user.deleteAccount.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountCard();
    await component.get("button").trigger("click");
    await flushPromises();
    typeName(name);
    await flushPromises();

    await expect(component.getComponent(UiConfirmDialog).props("confirm")()).resolves.toBe(false);
    expect(signOutOfBrowser).not.toHaveBeenCalled();
  });
});
