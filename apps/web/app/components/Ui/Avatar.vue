<script setup lang="ts">
import { Avatar } from "@vuetify/v0";

interface Props {
  image?: string;
  // The one picture a page is about, such as a profile's own, rather than one beside a name in a row
  isLarge?: true;
  // An icon's size, for a row's leading column, where it lines up with the rows marked by an icon
  isSmall?: true;
  // The alt text of the image, and the letter shown until it loads or when there is none
  name: string;
}

const { image = "", isLarge, isSmall, name } = defineProps<Props>();
// A server-rendered image can finish loading before hydration attaches the load listener, and Vuetify 0 never looks
// Again, so the letter would stay up over a loaded image. NuxtImg reports a load that landed before it mounted
const NuxtImg = resolveComponent("NuxtImg");
</script>

<template>
  <Avatar.Root
    :class="isLarge ? 'size-24 ui-title' : isSmall ? 'size-6 text-sm' : 'size-8'"
    flex
    shrink-0
    items-center
    justify-center
    of-hidden
    ui-frame
    ui-pill
  >
    <Avatar.Image v-if="image" :as="NuxtImg" :alt="name" :src="image" size-full object-cover />
    <Avatar.Fallback aria-hidden="true" text-accent>{{ name.charAt(0).toUpperCase() }}</Avatar.Fallback>
  </Avatar.Root>
</template>
