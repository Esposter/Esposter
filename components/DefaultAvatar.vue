<script setup lang="ts">
import { getInitials } from "@/util/text";

interface DefaultAvatarProps {
  name: string;
}

const props = defineProps<DefaultAvatarProps>();
const { name } = $(toRefs(props));
</script>

<template>
  <v-avatar color="background">
    {{ getInitials(name) }}
  </v-avatar>
</template>
