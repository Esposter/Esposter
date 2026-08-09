// @vitest-environment nuxt
import MessageModelStatusPickerForm from "@/components/Message/Model/Status/PickerForm.vue";
import StyledButton from "@/components/Styled/Button.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useStatusStore } from "@/store/message/user/status";
import { UserStatus } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { VTextField } from "vuetify/components";
// AuthClient is a better-auth dynamic-path Proxy, so useSession is not a configurable own property and cannot
// Be spied on directly — mock the module and drive useSession through a hoisted mock instead
const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<() => unknown>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe("messageModelStatusPickerForm", () => {
  const server = setupMswTrpc();
  const userId = crypto.randomUUID();
  const message = "message";
  const draftMessage = "draftMessage";
  const rejectedMessage = "rejectedMessage";
  // Drives the picker the way the menu does — type a message, hit Save — against a server that refuses the
  // Write, and settles it, so each test only has to say what the row held going in
  const submitRejectedMessage = async () => {
    let signalSaveRequested = noop;
    const saveRequested = new Promise<void>((resolve) => {
      signalSaveRequested = resolve;
    });
    server.use(
      trpcMsw.user.upsertStatus.mutation(() => {
        signalSaveRequested();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "rejected" });
      }),
    );
    const component = await mountSuspended(MessageModelStatusPickerForm);
    const textField = component.getComponent(VTextField);
    textField.vm.$emit("update:model-value", rejectedMessage);
    await flushPromises();
    component.getComponent(StyledButton).vm.$emit("click");
    await saveRequested;
    await flushPromises();
    return textField;
  };

  beforeEach(() => {
    useSessionMock.mockReturnValue(ref({ data: { user: { id: userId } } }));
    // The component mounts into the nuxt app's pinia, which every test in the file shares, so each starts from
    // A user whose status is whatever it seeds
    const statusStore = useStatusStore();
    const { statusMap } = storeToRefs(statusStore);
    statusMap.value.clear();
  });

  // The picker closes on submit, so a draft that outlived a rejection would come back on the next open showing
  // A value the server refused — beside a status bar reading the row it was rolled back to. The row owns both
  // Fields here precisely because the surface holding the draft is gone by the time the write settles
  test("re-seeds the draft from the stored row when the save is rejected", async () => {
    expect.hasAssertions();

    const statusStore = useStatusStore();
    const { statusMap } = storeToRefs(statusStore);
    statusMap.value.set(userId, {
      createdAt: new Date(0),
      deletedAt: null,
      expiresAt: null,
      isConnected: true,
      message,
      status: UserStatus.Online,
      updatedAt: new Date(0),
    });
    const textField = await submitRejectedMessage();

    expect(statusMap.value.get(userId)?.message).toBe(message);
    expect(textField.props("modelValue")).toBe(message);
  });

  // A first status has no row to apply the write to and so none to roll back, which leaves the clone's source
  // Untouched by the rejection — the one case where following the row is not enough to clear the refused value
  test("clears the draft when a rejected save had no stored row to roll back", async () => {
    expect.hasAssertions();

    const statusStore = useStatusStore();
    const { statusMap } = storeToRefs(statusStore);
    const textField = await submitRejectedMessage();

    expect(statusMap.value.has(userId)).toBe(false);
    expect(textField.props("modelValue")).toBe("");
  });

  // The row carries more than the two fields this draft holds, so a presence push flipping the connection state
  // Is still a write to what the draft was cloned from. Following every such write clears a message the user is
  // Part-way through typing, in a menu that is still open in front of them
  test("keeps the typed draft when a presence push writes to the stored row", async () => {
    expect.hasAssertions();

    const statusStore = useStatusStore();
    const { statusMap } = storeToRefs(statusStore);
    const storedStatus = {
      createdAt: new Date(0),
      deletedAt: null,
      expiresAt: null,
      isConnected: false,
      message,
      status: UserStatus.Online,
      updatedAt: new Date(0),
    };
    statusMap.value.set(userId, storedStatus);
    const component = await mountSuspended(MessageModelStatusPickerForm);
    const textField = component.getComponent(VTextField);
    textField.vm.$emit("update:model-value", draftMessage);
    await flushPromises();
    statusMap.value.set(userId, { ...storedStatus, isConnected: true });
    await flushPromises();

    expect(textField.props("modelValue")).toBe(draftMessage);
  });

  // Everything the save files is keyed by the user — the queue key, the optimistic read, the row the rollback
  // Restores — so a save without a session has nothing to file under and is not worth sending to be refused
  test("does not save without a session to file the write under", async () => {
    expect.hasAssertions();

    useSessionMock.mockReturnValue(ref({ data: null }));
    const upsertStatus = vi.fn<() => never>(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "rejected" });
    });
    server.use(trpcMsw.user.upsertStatus.mutation(upsertStatus));
    const component = await mountSuspended(MessageModelStatusPickerForm);
    component.getComponent(StyledButton).vm.$emit("click");
    await flushPromises();

    expect(upsertStatus).not.toHaveBeenCalled();
  });
});
