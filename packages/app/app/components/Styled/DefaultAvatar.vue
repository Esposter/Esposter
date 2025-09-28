<script setup lang="ts">
import type { VAvatar } from "vuetify/components";

interface StyledDefaultAvatarProps {
  avatarProps?: VAvatar["$props"];
}

const { avatarProps } = defineProps<StyledDefaultAvatarProps>();
</script>

<template>
  <v-avatar color="background" :="avatarProps">
    <v-icon icon="mdi-account-multiple" />
  </v-avatar>
</template>
