<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";

const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible } = storeToRefs(userSettingsDialogStore);
</script>

<template>
  <UiIconButton
    label="User Settings"
    :meaning="UiIconMeaning.Settings"
    :variant="UiButtonVariant.Quiet"
    @click="isVisible = true"
  />
</template>
