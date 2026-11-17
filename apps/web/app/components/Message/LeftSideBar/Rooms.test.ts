// @vitest-environment nuxt
import MessageLeftSideBarRooms from "#src/components/Message/LeftSideBar/Rooms.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { createEmptyPage } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageLeftSideBarRooms", () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = v7();

  // A read that failed is not a reader with no rooms: the list says so and offers a retry, where it would otherwise read
  // As the empty state's "No rooms yet"
  test("a failed read of the rooms says so rather than reading as empty", async () => {
    expect.hasAssertions();

    // The sidebar reads the session through `useFetch`, which the mock answers as a `{ data }` pair
    useSession.mockReturnValue({ data: ref({ user: { id: userId } }) });
    trpcMsw.room.readRooms.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.room.category.readRoomCategories.query(() => []);
    const component = await mountSuspended(MessageLeftSideBarRooms, { attachTo: document.body });
    await flushPromises();

    expect(component.text()).toContain("The rooms could not be loaded.");
    expect(component.text()).not.toContain("No rooms yet");
  });

  // A failed read of the categories is not a failed read of the rooms, and the rooms still list
  // The list says which read failed, so its headers are not taken for having none
  test("a failed read of the room categories says so while the rooms still read", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue({ data: ref({ user: { id: userId } }) });
    trpcMsw.room.readRooms.query(() => createEmptyPage());
    trpcMsw.room.category.readRoomCategories.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountSuspended(MessageLeftSideBarRooms, { attachTo: document.body });
    await flushPromises();

    expect(component.text()).toContain("The room categories could not be loaded.");
    expect(component.text()).not.toContain("The rooms could not be loaded.");
  });
});
