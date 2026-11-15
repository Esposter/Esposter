<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useFindReplaceStore } from "#src/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { goToOccurrence } = findReplaceStore;
const { occurrences } = storeToRefs(findReplaceStore);
</script>

<template>
  <UiIconButton
    :disabled="occurrences.length === 0"
    label="Next match (Enter)"
    :meaning="UiIconMeaning.Next"
    :variant="UiButtonVariant.Quiet"
    @click="goToOccurrence(1)"
  />
</template>
