<script setup lang="ts">
import type { User } from "better-auth";

import { StatusTokenMap } from "@/services/message/user/status/StatusTokenMap";
import { useStatusStore } from "@/store/message/user/status";

interface Props {
  id: User["id"];
  image: User["image"];
  // The one picture a profile is about, rather than one beside a name in a row
  isLarge?: true;
  // An icon's size, for a row's mark column
  isSmall?: true;
  name: User["name"];
}

// A member's picture with their status as a dot on its corner. The dot is decoration: whatever shows the avatar says
// The status in words, in its label or beside it
const { id, image, isLarge, isSmall, name } = defineProps<Props>();
const statusStore = useStatusStore();
const { getUserStatus } = statusStore;
</script>

<template>
  <span inline-flex shrink-0 relative>
    <UiAvatar :image="image ?? ''" :is-large :is-small :name />
    <span
      :class="isLarge ? 'size-6' : 'size-3'"
      :style="{ backgroundColor: `var(--ui-${StatusTokenMap[getUserStatus(id)]})` }"
      aria-hidden="true"
      bottom-0
      right-0
      absolute
      ui-pill
    />
  </span>
</template>
