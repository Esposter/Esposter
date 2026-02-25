<script setup lang="ts">
import type { Session } from "@/models/auth/Session";
import type { VAvatar } from "vuetify/components/VAvatar";

import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
import { useStatusStore } from "@/store/message/user/status";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StatusAvatarProps {
  avatarProps?: VAvatar["$props"];
  id: Session["user"]["id"];
  image: Session["user"]["image"];
  name: Session["user"]["name"];
}

const { avatarProps, id, image, name } = defineProps<StatusAvatarProps>();
const statusStore = useStatusStore();
const { getStatusEnum } = statusStore;
const badge = computed(() => {
  const userStatusEnum = getStatusEnum(id);
  return StatusBadgePropsMap[userStatusEnum];
});
</script>

<template>
  <StyledAvatar :badge="{ ...badge, location: 'bottom end' }" :image :name :="avatarProps" />
</template>
