<script setup lang="ts">
import type { VAvatar } from "vuetify/components";

interface StyledDefaultAvatarProps {
  avatarProps?: VAvatar["$props"];
}

const { avatarProps } = defineProps<StyledDefaultAvatarProps>();
const slots = defineSlots<{ badge?: () => VNode }>();
</script>

<template>
  <v-avatar color="background" :="avatarProps">
    <v-icon icon="mdi-account-multiple" />
    <template v-for="(_slot, name) of slots" #[name]>
      <slot :name />
    </template>
  </v-avatar>
</template>
