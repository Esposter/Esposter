<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";

import { RightDrawer } from "#src/models/message/RightDrawer";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { RIGHT_DRAWER_TOGGLES } from "#src/services/message/constants";
import { NotificationTypeLabelMap } from "#src/services/message/NotificationTypeLabelMap";
import { NotificationTypeMeaningMap } from "#src/services/message/NotificationTypeMeaningMap";
import { RightDrawerToggleMap } from "#src/services/message/RightDrawerToggleMap";
import { useCallStore } from "#src/store/message/room/call/index";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { useMessageLayoutStore } from "#src/store/message/ui/layout";
import { NotificationType } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const { smAndUp } = useUiDisplay();
const callStore = useCallStore();
const { isConnecting, isInCall } = storeToRefs(callStore);
const { joinCallByRoomId, leaveCall } = callStore;
// The header's pane toggles, as rows checked while their pane is open
const drawerToggles = RIGHT_DRAWER_TOGGLES.map((drawer) => ({
  meaning: RightDrawerToggleMap[drawer].meaning,
  title: RightDrawerToggleMap[drawer].title,
  ...useToggleRightDrawer(drawer),
}));
const messageLayoutStore = useMessageLayoutStore();
const { openRightDrawer } = messageLayoutStore;
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { applyMyUserToRoomField, executeUserToRoomMutation } = userToRoomStore;
const { myUserToRoom } = storeToRefs(userToRoomStore);
const updateNotificationType = (newNotificationType: NotificationType) => {
  const roomId = currentRoomId.value;
  if (!roomId || !myUserToRoom.value) return;
  executeUserToRoomMutation(
    () => $trpc.userToRoom.updateUserToRoom.mutate({ notificationType: newNotificationType, roomId }),
    { applyOptimistic: () => applyMyUserToRoomField(roomId, "notificationType", newNotificationType), key: roomId },
  );
};
// On a phone the header leaves the call and its toggles to this menu, so they lead it
const headerItems = computed<Item[]>(() =>
  smAndUp.value
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
        ...drawerToggles.map(({ isOpen, meaning, title, toggle }) => ({
          isChecked: isOpen.value,
          meaning,
          onClick: toggle,
          title,
        })),
      ],
);
const items = computed<Item[]>(() => [
  ...headerItems.value,
  {
    isGroupStart: headerItems.value.length > 0,
    meaning: UiIconMeaning.Pin,
    onClick: () => openRightDrawer(RightDrawer.Pinned),
    title: "Pinned Messages",
  },
  ...Object.values(NotificationType).map<Item>((type, index) => ({
    isGroupStart: index === 0,
    isSelected: type === (myUserToRoom.value?.notificationType ?? NotificationType.DirectMessage),
    meaning: NotificationTypeMeaningMap[type],
    onClick: () => updateNotificationType(type),
    title: NotificationTypeLabelMap[type],
  })),
]);
</script>

<!-- What a room offers now and then, behind one mark at every width: the panes read less often than the threads, the
     members and the search, and the notification level as a group of radios, which show the level the reader has as
     soon as the menu opens. Discord keeps a bell of its own in the header; one mark fewer is what lets the header fit a
     phone without a second bar of buttons, and on a phone the header's call and toggles lead it -->
<template>
  <UiOverflowMenu :items label="Room actions" />
</template>
