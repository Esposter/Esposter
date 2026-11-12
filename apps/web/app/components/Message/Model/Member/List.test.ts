// @vitest-environment nuxt
import MessageModelMemberList from "@/components/Message/Model/Member/List.vue";
import UiList from "@/components/Ui/List/Index.vue";
import UiPopover from "@/components/Ui/Popover.vue";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelMemberList", () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("room");
  const firstMember = { ...createUser({ name: "first" }), displayName: "first" };
  const secondMember = { ...createUser({ name: "second" }), displayName: "second" };

  // A press on another member light-dismisses the open profile natively before its click moves the profile there, and
  // The browser reports that dismissal after the click: it is the first member's, so it must not close the second's
  test("keeps the profile of the member pressed next when the first member's dismissal is reported after the move", async () => {
    expect.hasAssertions();

    trpcMsw.room.readMembers.query(() => ({ hasMore: false, items: [firstMember, secondMember], nextCursor: "" }));
    trpcMsw.room.readMembersCount.query(() => 2);
    trpcMsw.room.readMemberCountsByTopRole.query(() => []);
    trpcMsw.room.readMutualRooms.query(() => []);
    trpcMsw.user.readStatuses.query(() => []);
    trpcMsw.role.readMemberRoles.query(() => []);
    const roomStore = useRoomStore();
    roomStore.pushRooms({ ...room });
    const component = await mountSuspended(
      defineComponent({
        setup() {
          setCurrentRoomId(room.id);
          return () => h(MessageModelMemberList);
        },
      }),
      { attachTo: document.body },
    );
    await flushPromises();
    const list = component.getComponent(UiList);
    list.vm.$emit("select", firstMember.id);
    await flushPromises();
    list.vm.$emit("select", secondMember.id);
    await flushPromises();
    component.get('[role="dialog"]').element.dispatchEvent(Object.assign(new Event("toggle"), { newState: "closed" }));
    await flushPromises();

    expect(component.getComponent(UiPopover).props("isOpen")).toBe(true);
    expect(component.get('[role="dialog"]').attributes("aria-label")).toBe(secondMember.displayName);
  });
});
