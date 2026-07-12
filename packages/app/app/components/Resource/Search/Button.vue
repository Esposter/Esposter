<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useSearchDialogStore } from "@/store/resource/searchDialog";

const session = authClient.useSession();
const searchDialogStore = useSearchDialogStore();
const { isOpen } = storeToRefs(searchDialogStore);
</script>

<template>
  <StyledTooltipIconButton
    v-if="session.data"
    icon="mdi-magnify"
    text="Search resources (Ctrl+K)"
    :tooltip-props="{ location: 'bottom' }"
    @click="isOpen = true"
  />
</template>
