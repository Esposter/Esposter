<script setup lang="ts">
import { getInitials } from "@/util/text/getInitials";
interface StyledDefaultAvatarProps {
  name: string;
}

const { name } = defineProps<StyledDefaultAvatarProps>();
</script>

<template>
  <v-avatar color="background">
    {{ getInitials(name) }}
  </v-avatar>
</template>
