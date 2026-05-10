<script setup lang="ts">
import type { User } from "better-auth";
import type { VAvatar } from "vuetify/components/VAvatar";

import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
import { useStatusStore } from "@/store/message/user/status";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StatusAvatarProps {
  avatarAttrs?: VAvatar["$attrs"];
  avatarProps?: VAvatar["$props"];
  id: User["id"];
  image: User["image"];
  name: User["name"];
}

const { avatarAttrs = {}, avatarProps = {}, id, image, name } = defineProps<StatusAvatarProps>();
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
        :avatar-attrs
        :avatar-props
        :badge="{ ...badge, location: 'bottom end' }"
        :image
        :name
        :="tooltipProps"
      />
    </template>
  </v-tooltip>
</template>
