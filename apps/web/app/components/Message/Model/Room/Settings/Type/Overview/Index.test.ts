// @vitest-environment nuxt
import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";

import MessageModelRoomSettingsTypeOverviewIndex from "@/components/Message/Model/Room/Settings/Type/Overview/Index.vue";
import MessageModelRoomSettingsTypeOverviewSlowmodeField from "@/components/Message/Model/Room/Settings/Type/Overview/SlowmodeField.vue";
import MessageModelRoomSettingsTypeOverviewTopicField from "@/components/Message/Model/Room/Settings/Type/Overview/TopicField.vue";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeOverviewIndex", () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("name");

  // Another admin's topic change reaches a panel the reader has not touched, so the field shows it rather than the
  // Topic the panel was opened on
  test("shows a topic another client changed while the reader has not edited it", async () => {
    expect.hasAssertions();

    trpcMsw.room.category.readRoomCategories.query(() => []);
    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewIndex, { props: { room } });
    await component.setProps({ room: { ...room, topic: "a" } });

    expect(component.findComponent(MessageModelRoomSettingsTypeOverviewTopicField).get("input").element.value).toBe(
      "a",
    );
  });

  // A save writes the field the reader edited and no other. The topic another admin set since the panel opened is
  // Not written back with the topic the panel was opened on, which would revert their change
  test("sends only the field the reader edited, not one another client changed since the panel opened", async () => {
    expect.hasAssertions();

    const { promise: saved, resolve: resolveSaved } = Promise.withResolvers<void>();
    const inputs: UpdateRoomInput[] = [];
    trpcMsw.room.category.readRoomCategories.query(() => []);
    trpcMsw.room.updateRoom.mutation(({ input }) => {
      inputs.push(input);
      resolveSaved();
      return { ...room, ...input };
    });
    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewIndex, { props: { room } });
    await component.setProps({ room: { ...room, topic: "a" } });
    const slowmodeInput = component.findComponent(MessageModelRoomSettingsTypeOverviewSlowmodeField).get("input");
    await slowmodeInput.setValue("1");
    await slowmodeInput.trigger("focusout");
    await saved;
    await flushPromises();

    expect(inputs).toStrictEqual([
      { id: room.id, slowmodeMs: Temporal.Duration.from({ seconds: 1 }).total("milliseconds") },
    ]);
  });

  // The server trims the topic it stores, and its copy of the row reaches the store through the room subscription
  // Before the save answers. Settling against that copy must clear the edit, or the next blur writes the same topic again
  test("writes a topic once when the server trims it to the value already stored", async () => {
    expect.hasAssertions();

    const { promise: saved, resolve: resolveSaved } = Promise.withResolvers<void>();
    const inputs: UpdateRoomInput[] = [];
    const roomStore = useRoomStore();
    const { rooms } = storeToRefs(roomStore);
    trpcMsw.room.category.readRoomCategories.query(() => []);
    trpcMsw.room.updateRoom.mutation(({ input }) => {
      inputs.push(input);
      roomStore.storeUpdateRoom({ id: room.id, topic: "a" });
      resolveSaved();
      return { ...room, ...input, topic: "a" };
    });
    roomStore.pushRooms({ ...room });
    // Read back by id, since the list belongs to the app rather than to this test
    const storedRoom = rooms.value.find(({ id }) => id === room.id);

    assert.exists(storedRoom);

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewIndex, { props: { room: storedRoom } });
    const topicInput = component.findComponent(MessageModelRoomSettingsTypeOverviewTopicField).get("input");
    await topicInput.setValue("a ");
    await topicInput.trigger("focusout");
    await saved;
    await flushPromises();
    await topicInput.trigger("focusout");
    await flushPromises();

    expect(inputs).toStrictEqual([{ id: room.id, topic: "a" }]);
  });
});
