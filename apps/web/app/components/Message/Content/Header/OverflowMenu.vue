<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";

import { RightDrawer } from "#src/models/message/RightDrawer";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { NotificationTypeLabelMap } from "#src/services/message/NotificationTypeLabelMap";
import { NotificationTypeMeaningMap } from "#src/services/message/NotificationTypeMeaningMap";
import { useLayoutStore } from "#src/store/layout";
import { useCallStore } from "#src/store/message/room/call/index";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { useMessageLayoutStore } from "#src/store/message/ui/layout";
import { NotificationType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
const callStore = useCallStore();
const { isConnecting, isInCall } = storeToRefs(callStore);
const { joinCallByRoomId, leaveCall } = callStore;
const { isOpen: isSearchOpen, toggle: toggleSearch } = useToggleRightDrawer(RightDrawer.Search);
const { isOpen: isMemberListOpen, toggle: toggleMemberList } = useToggleRightDrawer(RightDrawer.Member);
const messageLayoutStore = useMessageLayoutStore();
const { openRightDrawer } = messageLayoutStore;
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom, setMyUserToRoom } = userToRoomStore;
const { myUserToRoom } = storeToRefs(userToRoomStore);
const { executeMutation } = useMutation();
const updateNotificationType = (newNotificationType: NotificationType) => {
  const roomId = currentRoomId.value;
  if (!roomId || !myUserToRoom.value) return;
  executeMutation(() => $trpc.userToRoom.updateUserToRoom.mutate({ notificationType: newNotificationType, roomId }), {
    applyOptimistic: () => {
      const previousUserToRoom = getMyUserToRoom(roomId);
      if (!previousUserToRoom) return noop;

      const { notificationType: previousNotificationType } = previousUserToRoom;
      setMyUserToRoom(roomId, { ...previousUserToRoom, notificationType: newNotificationType });
      return () => {
        const currentUserToRoom = getMyUserToRoom(roomId);
        if (currentUserToRoom)
          setMyUserToRoom(roomId, { ...currentUserToRoom, notificationType: previousNotificationType });
      };
    },
    key: roomId,
  });
};
// Where the drawers do not dock, the header leaves the call and its two toggles to this menu, so they lead it
const headerItems = computed<Item[]>(() =>
  isDesktop.value
    ? []
    : [
        isInCall.value
          ? { isDanger: true, meaning: UiIconMeaning.HangUp, onClick: leaveCall, title: "Leave Call" }
          : {
              loading: isConnecting.value,
              meaning: UiIconMeaning.Call,
              onClick: () => joinCallByRoomId(currentRoomId.value),
              title: "Start Call",
            },
        { isChecked: isSearchOpen.value, meaning: UiIconMeaning.Search, onClick: toggleSearch, title: "Search" },
        {
          isChecked: isMemberListOpen.value,
          meaning: UiIconMeaning.Members,
          onClick: toggleMemberList,
          title: "Member List",
        },
      ],
);
const items = computed<Item[]>(() => [
  ...headerItems.value,
  {
    isGroupStart: headerItems.value.length > 0,
    meaning: UiIconMeaning.Comment,
    onClick: () => openRightDrawer(RightDrawer.Threads),
    title: "Followed Threads",
  },
  { meaning: UiIconMeaning.Pin, onClick: () => openRightDrawer(RightDrawer.Pinned), title: "Pinned Messages" },
  ...Object.values(NotificationType).map<Item>((type, index) => ({
    isGroupStart: index === 0,
    isSelected: type === (myUserToRoom.value?.notificationType ?? NotificationType.DirectMessage),
    meaning: NotificationTypeMeaningMap[type],
    onClick: () => updateNotificationType(type),
    title: NotificationTypeLabelMap[type],
  })),
]);
</script>

<!-- What a room offers now and then, behind one mark at every width: the panes read less often than the members and
     the search, and the notification level as a group of radios, which show the level the reader has as soon as the
     menu opens. Discord keeps a bell of its own in the header; one mark fewer is what lets the header fit a phone
     without a second bar of buttons, and below the cut where the drawers dock the header's call and toggles lead it -->
<template>
  <UiOverflowMenu :items label="Room actions" />
</template>
