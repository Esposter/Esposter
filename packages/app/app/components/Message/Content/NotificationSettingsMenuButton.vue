<script setup lang="ts">
import { NotificationTypeLabelMap } from "@/services/message/NotificationTypeLabelMap";
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
const NOTIFICATION_TYPE_LABELS = Object.entries(NotificationTypeLabelMap);
const { executeMutation } = useMutation();
const updateNotificationType = async (newNotificationType: NotificationType) => {
  const roomId = currentRoomId.value;
  if (!roomId || !myUserToRoom.value) return;
  await executeMutation(
    () => $trpc.userToRoom.updateUserToRoom.mutate({ notificationType: newNotificationType, roomId }),
    {
      // Read as the write is sent, so a rejected change restores the setting the write ahead of it stored rather
      // Than the one on screen when the radio was clicked
      applyOptimistic: () => {
        const previousUserToRoom = getMyUserToRoom(roomId);
        if (!previousUserToRoom) return noop;

        const { notificationType: previousNotificationType } = previousUserToRoom;
        setMyUserToRoom(roomId, { ...previousUserToRoom, notificationType: newNotificationType });
        return () => {
          // Only the field this write moved, against the record as it stands — reinstating the row as a whole
          // Would undo everything else that landed on it while this write was in flight
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
  <StyledTooltipMenuIconButton
    :button-props="{ size: 'small' }"
    :icon="notificationType === NotificationType.All ? 'mdi-bell' : 'mdi-bell-off'"
    :menu-props="{ closeOnContentClick: false, location: 'bottom' }"
    text="Notification Settings"
    :tooltip-props="{ location: 'bottom' }"
  >
    <StyledCard pr-2>
      <v-radio-group
        :model-value="notificationType"
        @update:model-value="updateNotificationType($event as NotificationType)"
      >
        <v-radio v-for="[value, label] of NOTIFICATION_TYPE_LABELS" :key="value" :value :label>
          <template #label="{ props: labelProps }">
            <v-label :="labelProps" text-label-large :text="label" />
          </template>
        </v-radio>
      </v-radio-group>
    </StyledCard>
  </StyledTooltipMenuIconButton>
</template>
