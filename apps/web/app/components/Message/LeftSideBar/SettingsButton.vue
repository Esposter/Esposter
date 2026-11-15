<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useUserSettingsDialogStore } from "#src/store/message/user/settings/dialog";

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
