<script setup lang="ts">
import type { Promisable } from "type-fest";

import { useUserLinkedAccountDialogStore } from "#src/store/user/linkedAccountDialog";
import { toTitleCase } from "#src/util/text/toTitleCase";

interface Props {
  provider: string;
  unlink: () => Promisable<unknown>;
}

defineProps<Props>();
const userLinkedAccountDialogStore = useUserLinkedAccountDialogStore();
const { unlinkingProvider } = storeToRefs(userLinkedAccountDialogStore);
// The card owns the lookup and hands the account down, so only the open state is read from the primitive here
const { isOpen } = useSingletonDialog(unlinkingProvider);
</script>

<template>
  <UiConfirmDialog v-model="isOpen" confirm-label="Unlink" :title="`Unlink ${toTitleCase(provider)}`" :confirm="unlink">
    <p>Unlink {{ toTitleCase(provider) }} from this account? You can link it again later.</p>
  </UiConfirmDialog>
</template>
