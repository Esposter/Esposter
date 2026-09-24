<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { NotificationTypeLabelEntries } from "@/services/message/NotificationTypeLabelMap";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { NotificationType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom, setMyUserToRoom } = userToRoomStore;
const { myUserToRoom } = storeToRefs(userToRoomStore);
const notificationType = computed(() => myUserToRoom.value?.notificationType ?? NotificationType.DirectMessage);
const notificationTypeItems = NotificationTypeLabelEntries.map(([value, title]) => ({ title, value }));
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
</script>

<template>
  <UiPopover label="Notification Settings" :variant="UiButtonVariant.Quiet" px-0>
    <template #trigger>
      <UiIcon v-if="notificationType === NotificationType.All" :meaning="UiIconMeaning.Notifications" />
      <UiIcon v-else :meaning="UiIconMeaning.NotificationsOff" />
    </template>
    <UiRadioGroup
      :model-value="notificationType"
      :items="notificationTypeItems"
      label="Notify me about"
      @update:model-value="(value) => updateNotificationType(value as NotificationType)"
    />
  </UiPopover>
</template>
