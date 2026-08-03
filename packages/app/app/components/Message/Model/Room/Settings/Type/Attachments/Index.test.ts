// @vitest-environment nuxt
import type { RoomInMessage } from "@esposter/db-schema";

import { MEGABYTE } from "#shared/services/app/constants";
import MessageModelRoomSettingsTypeAttachmentsIndex from "@/components/Message/Model/Room/Settings/Type/Attachments/Index.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { MimeCategory, RoomType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { VSelect, VTextField } from "vuetify/components";

describe("messageModelRoomSettingsTypeAttachmentsIndex", () => {
  const server = setupMswTrpc();
  const name = "name";
  const maxFileSizeBytes = MEGABYTE;
  const room: RoomInMessage = {
    allowedMimeCategories: [MimeCategory.Audio, MimeCategory.Document, MimeCategory.Image, MimeCategory.Video],
    categoryId: null,
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    id: crypto.randomUUID(),
    image: "",
    isReadOnly: false,
    maxFileSizeBytes,
    name,
    participantKey: null,
    slowmodeMs: null,
    topic: "",
    type: RoomType.Room,
    updatedAt: new Date("1970-01-01"),
    userId: crypto.randomUUID(),
  };

  // Both fields save the whole form through one mutation key, so overlapping saves mark the earlier call
  // Stale — it never rolls back and never alerts, leaving the rejected value rendered as if it persisted.
  // Queued saves each settle as the latest for their key
  test("surfaces a rejected save even when the next control saves straight after", async () => {
    expect.hasAssertions();

    let resolveSecondSave = noop;
    const secondSave = new Promise<void>((resolve) => {
      resolveSecondSave = resolve;
    });
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
    // The component mounts into the nuxt app's pinia, so read the store it uses rather than a local one
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
});
