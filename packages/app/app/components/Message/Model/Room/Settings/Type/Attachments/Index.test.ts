// @vitest-environment nuxt
import type { RoomInMessage } from "@esposter/db-schema";

import { MEGABYTE } from "#shared/services/app/constants";
import MessageModelRoomSettingsTypeAttachmentsIndex from "@/components/Message/Model/Room/Settings/Type/Attachments/Index.vue";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useRoomStore } from "@/store/message/room";
import { MimeCategory } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";
import { VSelect, VTextField } from "vuetify/components";

describe("messageModelRoomSettingsTypeAttachmentsIndex", () => {
  const server = setupMswTrpc();
  const maxFileSizeBytes = MEGABYTE;
  const room: RoomInMessage = {
    ...createRoom("name"),
    allowedMimeCategories: [MimeCategory.Audio, MimeCategory.Document, MimeCategory.Image, MimeCategory.Video],
    maxFileSizeBytes,
  };

  // Both fields save the whole form through one mutation key, so overlapping saves mark the earlier call
  // Stale — it never rolls back and never alerts, leaving the rejected value rendered as if it persisted.
  // Queued saves each settle as the latest for their key
  test("surfaces a rejected save even when the next control saves straight after", async () => {
    expect.hasAssertions();

    const { promise: secondSave, resolve: resolveSecondSave } = Promise.withResolvers<void>();
    let saveCount = 0;
    server.use(
      trpcMsw.room.updateRoom.mutation(() => {
        saveCount += 1;
        if (saveCount === 2) resolveSecondSave();
        // A distinct message per call, so the alert store keeps both instead of refreshing one
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(saveCount) });
      }),
    );
    const component = await mountSuspended(MessageModelRoomSettingsTypeAttachmentsIndex, { props: { room } });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const textField = component.getComponent(VTextField);
    textField.vm.$emit("update:model-value", String(maxFileSizeBytes / MEGABYTE + 1));
    textField.vm.$emit("blur");
    component.getComponent(VSelect).vm.$emit("update:model-value", [MimeCategory.Image]);
    await secondSave;
    await flushPromises();

    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["1", "2"]);
  });

  // The controls are the form's draft and the row is only what is saved, so a rejection unwinds the row and
  // Leaves the entered value standing — the panel is still open beside the alert, and the retry is one blur
  // Away. Converging the controls onto the row would discard what the user typed without ever saying so
  test("keeps the entered value after a rejected save so the next one retries it", async () => {
    expect.hasAssertions();

    const { promise: firstSaveRequested, resolve: signalFirstSave } = Promise.withResolvers<void>();
    const { promise: secondSaveRequested, resolve: signalSecondSave } = Promise.withResolvers<void>();
    let saveCount = 0;
    server.use(
      trpcMsw.room.updateRoom.mutation(() => {
        saveCount += 1;
        if (saveCount === 1) signalFirstSave();
        else signalSecondSave();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(saveCount) });
      }),
    );
    // The settings dialog hands down the row out of the store, so the optimistic write and its rollback both
    // Reach the prop — a detached copy would never move under the form at all
    const roomStore = useRoomStore();
    const { rooms } = storeToRefs(roomStore);
    const { pushRooms } = roomStore;
    pushRooms({ ...room });
    // Read back by id rather than by position: the list belongs to the nuxt app rather than to this test, so
    // Taking the first room returns whatever an earlier test left there and the assertions below would be
    // Watching a row this test never wrote to
    const storedRoom = rooms.value.find(({ id }) => id === room.id);

    assert.exists(storedRoom);

    const component = await mountSuspended(MessageModelRoomSettingsTypeAttachmentsIndex, {
      props: { room: storedRoom },
    });
    const enteredMegabytes = maxFileSizeBytes / MEGABYTE + 1;
    const textField = component.getComponent(VTextField);
    textField.vm.$emit("update:model-value", String(enteredMegabytes));
    textField.vm.$emit("blur");
    await firstSaveRequested;
    await flushPromises();

    expect(storedRoom.maxFileSizeBytes).toBe(maxFileSizeBytes);
    expect(textField.props("modelValue")).toBe(enteredMegabytes);

    textField.vm.$emit("blur");
    await secondSaveRequested;
    await flushPromises();

    expect(saveCount).toBe(2);
  });
});
