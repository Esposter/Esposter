<script setup lang="ts">
import type { VAvatar } from "vuetify/components";

import { getInitials } from "@/util/text/getInitials";

interface StyledDefaultAvatarProps {
  avatarProps?: VAvatar["$props"];
  name: string;
}

const { avatarProps, name } = defineProps<StyledDefaultAvatarProps>();
</script>

<template>
  <v-avatar color="background" :="avatarProps">
    {{ getInitials(name) }}
  </v-avatar>
</template>
