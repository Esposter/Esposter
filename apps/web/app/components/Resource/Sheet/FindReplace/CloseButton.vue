<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

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
