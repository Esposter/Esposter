<script setup lang="ts">
import { getInitials } from "@/util";
import { VAvatar } from "vuetify/components";

interface DefaultAvatarProps {
  name: string;
}

const { name } = defineProps<DefaultAvatarProps>();
</script>

<template>
  <v-avatar color="background">
    {{ getInitials(name) }}
  </v-avatar>
</template>
