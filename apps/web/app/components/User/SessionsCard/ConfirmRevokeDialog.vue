<script setup lang="ts">
import type { Promisable } from "type-fest";

import { useUserSessionDialogStore } from "@/store/user/sessionDialog";

interface Props {
  deviceLabel: string;
  isCurrent?: true;
  revoke: () => Promisable<unknown>;
}

const { deviceLabel, isCurrent, revoke } = defineProps<Props>();
const userSessionDialogStore = useUserSessionDialogStore();
const { revokingId } = storeToRefs(userSessionDialogStore);
// The card owns the lookup and hands the session down, so only the open state is read from the primitive here
const { isOpen } = useSingletonDialog(revokingId);
</script>

<template>
  <UiConfirmDialog
    v-model="isOpen"
    :confirm-label="isCurrent ? 'Sign out' : 'Revoke'"
    :title="isCurrent ? 'Sign out' : 'Revoke session'"
    :confirm="revoke"
  >
    <p v-if="isCurrent">Sign this device out of your account? You will be sent back to the login page.</p>
    <p v-else>Sign {{ deviceLabel }} out of this account? Whoever is using it has to sign in again.</p>
  </UiConfirmDialog>
</template>
