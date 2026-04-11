<script setup lang="ts">
import type { User } from "better-auth";
import type { VAvatar } from "vuetify/components/VAvatar";

import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
import { useStatusStore } from "@/store/message/user/status";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StatusAvatarProps {
  avatarProps?: VAvatar["$props"];
  id: User["id"];
  image: User["image"];
  name: User["name"];
}

const { avatarProps, id, image, name } = defineProps<StatusAvatarProps>();
const statusStore = useStatusStore();
const { getStatusEnum, getStatusMessage } = statusStore;
const badge = computed(() => {
  const userStatusEnum = getStatusEnum(id);
  return StatusBadgePropsMap[userStatusEnum];
});
const statusTooltip = computed(() => {
  const message = getStatusMessage(id);
  const status = getStatusEnum(id);
  return message ? `${status} — ${message}` : status;
});
</script>

<template>
  <v-tooltip :text="statusTooltip" location="top">
    <template #activator="{ props: tooltipProps }">
      <StyledAvatar
        :="{ ...avatarProps, ...tooltipProps }"
        :badge="{ ...badge, location: 'bottom end' }"
        :image
        :name
      />
    </template>
  </v-tooltip>
</template>
