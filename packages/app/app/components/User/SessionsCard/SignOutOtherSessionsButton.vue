<script setup lang="ts">
interface Props {
  otherSessionCount: number;
}

const { otherSessionCount } = defineProps<Props>();
const emit = defineEmits<{ signOut: [onComplete: (isSuccessful?: boolean) => void] }>();
</script>

<template>
  <!-- Mounted once beside the list rather than per row, so it is the button and its dialog in one component -->
  <StyledDeleteFormDialog
    :card-props="{ title: 'Sign out everywhere else' }"
    :confirm-button-props="{ text: 'Sign out' }"
    @delete="(onComplete) => emit('signOut', onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <v-btn color="error" text="Sign out everywhere else" @click.stop="updateIsOpen(true)" />
    </template>
    Sign out every device except this one? That is
    {{ otherSessionCount === 1 ? "one other session" : `${otherSessionCount} other sessions` }}.
  </StyledDeleteFormDialog>
</template>
