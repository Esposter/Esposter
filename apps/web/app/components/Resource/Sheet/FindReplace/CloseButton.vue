<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useFindReplaceStore } from "#src/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <UiIconButton
    label="Close find and replace"
    :meaning="UiIconMeaning.Close"
    :variant="UiButtonVariant.Quiet"
    @click="isFindReplaceOpen = false"
  />
</template>
