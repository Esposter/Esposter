<script setup lang="ts">
import { useUserSessionDialogStore } from "@/store/user/sessionDialog";

interface Props {
  deviceLabel: string;
  isCurrent?: true;
}

const { deviceLabel, isCurrent } = defineProps<Props>();
const emit = defineEmits<{ revoke: [onComplete: (isSuccessful?: boolean) => void] }>();
const userSessionDialogStore = useUserSessionDialogStore();
const { revokingId } = storeToRefs(userSessionDialogStore);
// The card owns the lookup and hands the session down, so only the open state is read from the primitive here
const { isOpen } = useSingletonDialog(revokingId);
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title: isCurrent ? 'Sign out' : 'Revoke session' }"
    :confirm-button-props="{ text: isCurrent ? 'Sign out' : 'Revoke' }"
    @delete="(onComplete) => emit('revoke', onComplete)"
  >
    <template v-if="isCurrent">Sign this device out of your account? You will be sent back to the login page.</template>
    <template v-else> Sign {{ deviceLabel }} out of this account? Whoever is using it has to sign in again. </template>
  </StyledDeleteFormDialog>
</template>
