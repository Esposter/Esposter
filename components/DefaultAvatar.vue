<script setup lang="ts">
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
