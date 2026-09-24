<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  otherSessionCount: number;
}

const { otherSessionCount } = defineProps<Props>();
const emit = defineEmits<{ signOut: [onComplete: (isSuccessful?: boolean) => void] }>();
const isOpen = ref(false);
</script>

<template>
  <!-- Mounted once beside the heading rather than per row, so it is the button and its dialog in one component -->
  <UiButton aria-haspopup="dialog" @click="isOpen = true">
    <UiIcon :meaning="UiIconMeaning.SignOut" />
    Sign out everywhere else
  </UiButton>
  <UiConfirmDialog
    v-model="isOpen"
    confirm-label="Sign out"
    title="Sign out everywhere else"
    @confirm="(onComplete) => emit('signOut', onComplete)"
  >
    <p>
      Sign out every device except this one? That is
      {{ otherSessionCount === 1 ? "one other session" : `${otherSessionCount} other sessions` }}.
    </p>
  </UiConfirmDialog>
</template>
