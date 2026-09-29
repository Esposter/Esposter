<script setup lang="ts">
import type { Promisable } from "type-fest";

import { useUserApiKeyDialogStore } from "@/store/user/apiKeyDialog";

interface Props {
  deleteKey: () => Promisable<unknown>;
  name: string;
}

const { deleteKey, name } = defineProps<Props>();
const userApiKeyDialogStore = useUserApiKeyDialogStore();
const { deletingId } = storeToRefs(userApiKeyDialogStore);
// The card owns the lookup and hands the key down, so only the open state is read from the primitive here
const { isOpen } = useSingletonDialog(deletingId);
</script>

<template>
  <UiConfirmDialog v-model="isOpen" confirm-label="Delete" title="Delete API key" :confirm="deleteKey">
    <p>Delete {{ name }}? An agent using it is refused from its next call.</p>
  </UiConfirmDialog>
</template>
