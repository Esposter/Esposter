<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { RightDrawer } from "@/models/message/RightDrawer";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { NotificationTypeLabelMap } from "@/services/message/NotificationTypeLabelMap";
import { NotificationTypeMeaningMap } from "@/services/message/NotificationTypeMeaningMap";
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useMessageLayoutStore } from "@/store/message/ui/layout";
import { NotificationType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
const messageLayoutStore = useMessageLayoutStore();
const { rightDrawer } = storeToRefs(messageLayoutStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom, setMyUserToRoom } = userToRoomStore;
const { myUserToRoom } = storeToRefs(userToRoomStore);
const notificationType = computed(() => myUserToRoom.value?.notificationType ?? NotificationType.DirectMessage);
const { executeMutation } = useMutation();
const updateNotificationType = async (newNotificationType: NotificationType) => {
  const roomId = currentRoomId.value;
  if (!roomId || !myUserToRoom.value) return;
  await executeMutation(
    () => $trpc.userToRoom.updateUserToRoom.mutate({ notificationType: newNotificationType, roomId }),
    {
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
    },
  );
};
const openRightDrawer = (drawer: RightDrawer) => {
  rightDrawer.value = drawer;
  isRightDrawerOpen.value = true;
};
const items = computed<Item[]>(() => [
  { meaning: UiIconMeaning.Comment, onClick: () => openRightDrawer(RightDrawer.Threads), title: "Followed Threads" },
  { meaning: UiIconMeaning.Pin, onClick: () => openRightDrawer(RightDrawer.Pinned), title: "Pinned Messages" },
  ...Object.values(NotificationType).map<Item>((type, index) => ({
    isGroupStart: index === 0,
    isSelected: type === notificationType.value,
    meaning: NotificationTypeMeaningMap[type],
    onClick: () => updateNotificationType(type),
    title: NotificationTypeLabelMap[type],
  })),
]);
</script>

<!-- What a room offers now and then, behind one mark at every width: the panes read less often than the members and
     the search, and the notification level as a group of radios, which show the level the reader has as soon as the
     menu opens. Discord keeps a bell of its own in the header; one mark fewer is what lets the header fit a phone
     without a second bar of buttons -->
<template>
  <UiOverflowMenu :items label="Room actions" />
</template>
