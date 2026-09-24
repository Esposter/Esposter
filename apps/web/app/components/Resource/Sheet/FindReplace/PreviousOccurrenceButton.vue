<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { goToOccurrence } = findReplaceStore;
const { occurrences } = storeToRefs(findReplaceStore);
</script>

<template>
  <UiIconButton
    :disabled="occurrences.length === 0"
    label="Previous match (Shift+Enter)"
    :meaning="UiIconMeaning.Previous"
    :variant="UiButtonVariant.Quiet"
    @click="goToOccurrence(-1)"
  />
</template>
