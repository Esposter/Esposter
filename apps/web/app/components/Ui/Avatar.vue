<script setup lang="ts">
import { Avatar } from "@vuetify/v0";

interface Props {
  image?: string;
  // The alt text of the image, and the letter shown until it loads or when there is none
  name: string;
}

const { image = "", name } = defineProps<Props>();
</script>

<template>
  <Avatar.Root flex shrink-0 size-8 items-center justify-center of-hidden ui-frame>
    <Avatar.Image v-if="image" :alt="name" :src="image" size-full object-cover />
    <Avatar.Fallback aria-hidden="true" text-accent>{{ name.charAt(0).toUpperCase() }}</Avatar.Fallback>
  </Avatar.Root>
</template>
