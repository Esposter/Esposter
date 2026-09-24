<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <UiIconButton
    :aria-pressed="isFindReplaceOpen"
    label="Find and replace"
    :meaning="UiIconMeaning.Search"
    :variant="UiButtonVariant.Quiet"
    @click="isFindReplaceOpen = !isFindReplaceOpen"
  />
</template>
