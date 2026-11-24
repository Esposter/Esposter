// @vitest-environment nuxt
import type { ResourceInResource } from "@esposter/db-schema";

import { getMockSession } from "#server/trpc/context.test";
import ResourceShareDialog from "#src/components/Resource/ShareDialog.vue";
import UiForm from "#src/components/Ui/Form.vue";
import UiSelect from "#src/components/Ui/Select/Index.vue";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useNotificationStore } from "#src/store/notification";
import { MessageType, NotificationSeverity, ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe("resourceShareDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("General");
  const userId = getMockSession().user.id;
  const resource = { id: v7(), name: "Survey", type: ResourceType.Survey } as ResourceInResource;

  // The Shared notice says the room has the message, so it shows once the server accepts the message rather than when
  // The share is sent
  test("shows the shared notice only once the server accepts the message", async () => {
    expect.hasAssertions();

    const isAccepted = Promise.withResolvers<void>();
    trpcMsw.room.readRooms.query(() => ({ items: [{ ...room, displayName: room.name }], nextCursor: "" }));
    trpcMsw.message.createMessage.mutation(async () => {
      await isAccepted.promise;
      return createOptimisticMessage({ message: "", roomId: room.id, type: MessageType.Message }, userId);
    });
    const notificationStore = useNotificationStore();
    const createNotification = vi.spyOn(notificationStore, "createNotification");
    const component = await mountSuspended(ResourceShareDialog, { props: { modelValue: true, resource } });
    await flushPromises();
    component.findComponent(UiSelect).vm.$emit("update:modelValue", room.id);
    component.findComponent(UiForm).vm.$emit("submit");
    await flushPromises();
    const noticeCountWhileSending = createNotification.mock.calls.length;
    isAccepted.resolve();
    await flushPromises();

    expect(noticeCountWhileSending).toBe(0);
    expect(createNotification).toHaveBeenCalledExactlyOnceWith({
      action: { title: "Open room", to: RoutePath.Messages(room.id) },
      severity: NotificationSeverity.Success,
      title: `Shared to ${room.name}`,
    });
  });

  // A failed read of the rooms is drawn as the failure with its retry, not as a reader in no rooms
  test("a failed read of the rooms is drawn as the failure rather than as having no rooms", async () => {
    expect.hasAssertions();

    trpcMsw.room.readRooms.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountSuspended(ResourceShareDialog, { props: { modelValue: true, resource } });
    await flushPromises();

    expect(component.text()).toMatchInlineSnapshot(`"Share “Survey”Full screenCloseSomething went wrong Try again"`);
  });
});
