// @vitest-environment nuxt
import MessageModelStatusPickerForm from "#src/components/Message/Model/Status/PickerForm.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useStatusStore } from "#src/store/message/user/status";
import { UserStatus } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("messageModelStatusPickerForm", () => {
  const { trpcMsw } = setupMswTrpc();
  let userId: string;
  const message = "message";
  const draftMessage = "draftMessage";
  const rejectedMessage = "rejectedMessage";
  const createStoredStatus = (isConnected: boolean) => ({
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    isConnected,
    message,
    status: UserStatus.Online,
    updatedAt: new Date(0),
    userId,
    version: 0,
  });

  beforeEach(() => {
    // Every test in the file shares the nuxt app's pinia, so each files its status under a user no earlier test wrote
    userId = v7();
    useSession.mockReturnValue(ref({ data: { user: { id: userId } } }));
  });

  // A presence push lands while the save is in flight, and the server refuses the save. The refusal has to leave the
  // Status the row holds now, not the one it held when the save was sent
  test("a refused status change leaves the status the row holds, not the one it held when sent", async () => {
    expect.hasAssertions();

    const statusStore = useStatusStore();
    const { getUserStatus, storeStatus } = statusStore;
    const storedStatus = createStoredStatus(true);
    storeStatus(storedStatus);
    trpcMsw.user.upsertStatus.mutation(() => {
      storeStatus({ ...storedStatus, status: UserStatus.Idle, version: 1 });
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountSuspended(MessageModelStatusPickerForm);
    await component.get("input").setValue(rejectedMessage);
    await component.get("form").trigger("submit");
    await waitForSynchronizedFunctions();
    await flushPromises();

    expect(getUserStatus(userId)).toBe(UserStatus.Idle);
  });

  // The row carries more than the two fields this draft holds, so a presence push flipping the connection state
  // Is still a write to what the draft was cloned from. Following every such write clears a message the user is
  // Part-way through typing, in a menu that is still open in front of them
  test("keeps the typed draft when a presence push writes to the stored row", async () => {
    expect.hasAssertions();

    const statusStore = useStatusStore();
    const { storeStatus } = statusStore;
    const storedStatus = createStoredStatus(false);
    storeStatus(storedStatus);
    const component = await mountSuspended(MessageModelStatusPickerForm);
    const messageField = component.get("input");
    await messageField.setValue(draftMessage);
    storeStatus({ ...storedStatus, isConnected: true, version: 1 });
    await flushPromises();

    expect(messageField.element.value).toBe(draftMessage);
  });

  // Everything the save files is keyed by the user, so a save without a session has nothing to file under and is not
  // Worth sending to be refused
  test("does not save without a session to file the write under", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref({ data: null }));
    const upsertStatus = vi.fn<() => never>(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.user.upsertStatus.mutation(upsertStatus);
    const component = await mountSuspended(MessageModelStatusPickerForm);
    await component.get("form").trigger("submit");
    await flushPromises();

    expect(upsertStatus).not.toHaveBeenCalled();
  });
});
