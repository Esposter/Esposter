<script setup lang="ts">
import type { Promisable } from "type-fest";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  otherSessionCount: number;
  signOut: () => Promisable<unknown>;
}

const { otherSessionCount, signOut } = defineProps<Props>();
const isOpen = ref(false);
</script>

<template>
  <!-- Mounted once beside the heading rather than per row, so it is the button and its dialog in one component -->
  <UiButton aria-haspopup="dialog" @click="isOpen = true">
    <UiIcon :meaning="UiIconMeaning.SignOut" />
    Sign out everywhere else
  </UiButton>
  <UiConfirmDialog v-model="isOpen" confirm-label="Sign out" title="Sign out everywhere else" :confirm="signOut">
    <p>
      Sign out every device except this one? That is
      {{ otherSessionCount === 1 ? "one other session" : `${otherSessionCount} other sessions` }}.
    </p>
  </UiConfirmDialog>
</template>
