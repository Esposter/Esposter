<script setup lang="ts">
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible } = storeToRefs(userSettingsDialogStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-cog"
    text="User Settings"
    @click="isVisible = true"
  />
</template>
