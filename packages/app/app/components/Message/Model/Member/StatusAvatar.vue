<script setup lang="ts">
import type { User } from "better-auth";
import type { VAvatar } from "vuetify/components/VAvatar";

import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
import { useStatusStore } from "@/store/message/user/status";
// @TODO: https://github.com/vuejs/core/issues/11371
interface MemberStatusAvatarProps {
  avatarAttrs?: VAvatar["$attrs"];
  avatarProps?: VAvatar["$props"];
  id: User["id"];
  image: User["image"];
  name: User["name"];
}

const { avatarAttrs = {}, avatarProps = {}, id, image, name } = defineProps<MemberStatusAvatarProps>();
const statusStore = useStatusStore();
const { getStatusMessage, getUserStatus } = statusStore;
const badge = computed(() => ({ ...StatusBadgePropsMap[getUserStatus(id)], location: "bottom end" }));
const statusTooltip = computed(() => {
  const message = getStatusMessage(id);
  const status = getUserStatus(id);
  return message ? `${status} — ${message}` : status;
});
</script>

<template>
  <v-tooltip :text="statusTooltip">
    <template #activator="{ props: tooltipProps }">
      <StyledAvatar :avatar-attrs :avatar-props :badge :image :name :="tooltipProps" />
    </template>
  </v-tooltip>
</template>
