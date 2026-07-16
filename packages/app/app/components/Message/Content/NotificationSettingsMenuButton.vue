<script setup lang="ts">
import { NotificationTypeLabelMap } from "@/services/message/NotificationTypeLabelMap";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { NotificationType } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const userToRoomStore = useUserToRoomStore();
const { setMyUserToRoom } = userToRoomStore;
const { myUserToRoomMap } = storeToRefs(userToRoomStore);
const notificationType = computed(() => myUserToRoomMap.value?.notificationType ?? NotificationType.DirectMessage);
const notificationTypeLabels = Object.entries(NotificationTypeLabelMap);
const executeMutation = useMutation();
const updateNotificationType = async (newNotificationType: NotificationType) => {
  const roomId = currentRoomId.value;
  const userToRoom = myUserToRoomMap.value;
  if (!roomId || !userToRoom) return;
  await executeMutation(
    () => $trpc.userToRoom.updateUserToRoom.mutate({ notificationType: newNotificationType, roomId }),
    {
      applyOptimistic: () => {
        const oldNotificationType = userToRoom.notificationType;
        setMyUserToRoom(roomId, { ...userToRoom, notificationType: newNotificationType });
        return () => {
          setMyUserToRoom(roomId, { ...userToRoom, notificationType: oldNotificationType });
        };
      },
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
        hide-details
        @update:model-value="updateNotificationType($event as NotificationType)"
      >
        <v-radio v-for="[value, label] of notificationTypeLabels" :key="value" :value :label>
          <template #label="{ props: labelProps }">
            <v-label :="labelProps" text-label-large :text="label" />
          </template>
        </v-radio>
      </v-radio-group>
    </StyledCard>
  </StyledTooltipMenuIconButton>
</template>
